// backend/controllers/cardController.js

const axios = require('axios');
const sharp = require('sharp');
const tf = require('@tensorflow/tfjs');
const mobilenet = require('@tensorflow-models/mobilenet');
let modelPromise = mobilenet.load();
const { session } = require('../config/neo4j');

 exports.getAllCards = async (req, res) => {
  try {
    const result = await session.run(
      `MATCH (c:Card) RETURN elementId(c) AS id, c`
    );
    const cards = result.records.map(record => {
      let card = record.get('c').properties;
      card._id = record.get('id');
      return card;
    });
    res.status(200).json(cards);
  } catch (error) {
    console.error(" Error fetching cards:", error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

exports.createCard = async (req, res) => {
  const { subject, text, imageUrl, caption, tags } = req.body;
  try {
    const model = await modelPromise;

    let imgBuf;
    if (imageUrl.startsWith('data:')) {
      const base64Data = imageUrl.split(',')[1];
      imgBuf = Buffer.from(base64Data, 'base64');
    } else {
      const resp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      imgBuf = Buffer.from(resp.data);
    }

    const { data: rgb, info } = await sharp(imgBuf)
      .resize(224, 224)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const inputT = tf.tensor3d(rgb, [info.height, info.width, info.channels], 'int32');
    const embT = model.infer(inputT, true);
    const rawEmb = await embT.array();
    inputT.dispose(); embT.dispose();

    const embedding = Array.isArray(rawEmb) ? rawEmb.flat(Infinity) : rawEmb;

    const result = await session.run(
      `CREATE (c:Card {
         subject:   $subject,
         text:      $text,
         author:    $author,
         imageUrl:  $imageUrl,
         caption:   $caption,
         tags:      $tags,
         embedding: $embedding
       }) RETURN elementId(c) AS id, c`,
      { subject, text, author: req.user.email, imageUrl, caption, tags: tags || [], embedding }
    );

    const newCard = result.records[0].get('c').properties;
    newCard._id = result.records[0].get('id');
    res.status(201).json(newCard);
  } catch (error) {
    console.error("Error creating card:", error);
    res.status(500).json({ error: 'Failed to create card' });
  }
};

exports.deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await session.run(
      `MATCH (c:Card) WHERE elementId(c) = $id AND c.author = $author DELETE c`,
      { id, author: req.user.email }
    );
    if (result.summary.counters.updates().nodesDeleted === 0) {
      return res.status(404).json({ error: 'Card not found or unauthorized' });
    }
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error(" Error deleting card:", error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};

exports.duplicateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    const origRes = await session.run(
      `MATCH (c:Card) WHERE elementId(c) = $id RETURN c`, { id }
    );
    if (!origRes.records.length) return res.status(404).json({ error: 'Card not found' });
    const orig = origRes.records[0].get('c').properties;
    if (orig.author !== userEmail) return res.status(403).json({ error: 'Unauthorized' });

    const embedding = Array.isArray(orig.embedding) ? orig.embedding : [];

    const result = await session.run(
      `CREATE (c:Card {
         subject:   $subject,
         text:      $text,
         author:    $author,
         imageUrl:  $imageUrl,
         caption:   $caption,
         tags:      $tags,
         embedding: $embedding
       }) RETURN elementId(c) AS id, c`,
      { subject: orig.subject + ' (Copy)', text: orig.text, author: orig.author, imageUrl: orig.imageUrl,
        caption: orig.caption, tags: orig.tags || [], embedding }
    );
    const newCard = result.records[0].get('c').properties;
    newCard._id = result.records[0].get('id');
    res.status(201).json(newCard);
  } catch (error) {
    console.error(" Error duplicating card:", error);
    res.status(500).json({ error: 'Failed to duplicate card' });
  }
};

exports.reportCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, reportType, additionalInfo } = req.body;
    if (!email || !reportType || !additionalInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const cardRes = await session.run(
      `MATCH (c:Card) WHERE elementId(c) = $id RETURN c`, { id }
    );
    if (!cardRes.records.length) return res.status(404).json({ error: 'Card not found' });

    const reportData = JSON.stringify({ email, reportType, additionalInfo, timestamp: Date.now() });
    await session.run(
      `MATCH (c:Card) WHERE elementId(c) = $id
       SET c.reports = coalesce(c.reports, []) + $reportData`,
      { id, reportData }
    );
    res.status(200).json({ message: ` Report added to Card ${id}` });
  } catch (error) {
    console.error(" Error reporting card:", error);
    res.status(500).json({ error: 'Failed to report card' });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, text, imageUrl, caption, tags } = req.body;
    const userEmail = req.user.email;

    let embedding = null;
    if (imageUrl) {
      let imgBuf;
      if (imageUrl.startsWith('data:')) {
        const base64Data = imageUrl.split(',')[1];
        imgBuf = Buffer.from(base64Data, 'base64');
      } else {
        const resp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        imgBuf = Buffer.from(resp.data);
      }
      const { data: rgb, info } = await sharp(imgBuf)
        .resize(224,224)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject:true });
      const inputT = tf.tensor3d(rgb, [info.height, info.width, info.channels], 'int32');
      const embT = (await modelPromise).infer(inputT, true);
      const rawEmb = await embT.array();
      inputT.dispose(); embT.dispose();
      embedding = Array.isArray(rawEmb) ? rawEmb.flat(Infinity) : rawEmb;
    }

    const sets = [
      'c.subject  = $subject',
      'c.text     = $text',
      'c.imageUrl = $imageUrl',
      'c.caption  = $caption',
      'c.tags     = $tags'
    ];
    if (embedding) sets.push('c.embedding = $embedding');

    const result = await session.run(
      `MATCH (c:Card) WHERE elementId(c) = $id AND c.author = $author
       SET ${sets.join(',\n           ')}
       RETURN c`,
      { id, author: userEmail, subject, text, imageUrl, caption, tags, embedding }
    );
    if (!result.records.length) {
      return res.status(404).json({ error: 'Card not found or unauthorized' });
    }
    res.status(200).json(result.records[0].get('c').properties);
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: 'Failed to update card' });
  }
};
