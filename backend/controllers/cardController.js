
const axios    = require('axios');
const sharp    = require('sharp');
const tf       = require('@tensorflow/tfjs');
const mobilenet= require('@tensorflow-models/mobilenet');
let modelPromise = mobilenet.load();
const { session } = require('../config/neo4j');

async function linkByTags(cardId, tags) {
  if (!Array.isArray(tags) || !tags.length) return;
  await session.run(
    `
    UNWIND $tags AS tag
    MATCH (me:Card), (other:Card)
    WHERE elementId(me) = $id 
      AND elementId(other) <> $id
      AND tag IN other.tags
    MERGE (me)-[:HAS_TAG {tag: tag}]->(other)
    `,
    { id: cardId, tags }
  );
}

exports.getAllCards = async (req, res) => {
  try {
    const result = await session.run(
      `MATCH (c:Card) RETURN elementId(c) AS id, c`
    );
    const cards = result.records.map(r => {
      let c = r.get('c').properties;
      c._id = r.get('id');
      return c;
    });
    res.status(200).json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

exports.createCard = async (req, res) => {
  const { subject, text, imageUrl, caption, tags } = req.body;
  try {
    const model = await modelPromise;

    let imgBuf;
    if (imageUrl.startsWith('data:')) {
      const base64 = imageUrl.split(',')[1];
      imgBuf = Buffer.from(base64, 'base64');
    } else {
      const resp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      imgBuf = Buffer.from(resp.data);
    }

    const { data: rgb, info } = await sharp(imgBuf)
      .resize(224,224)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const inputT = tf.tensor3d(rgb, [info.height, info.width, info.channels], 'int32');
    const embT   = model.infer(inputT, true);
    const rawEmb = await embT.array();
    inputT.dispose(); embT.dispose();
    const embedding = Array.isArray(rawEmb) ? rawEmb.flat(Infinity) : rawEmb;

    const result = await session.run(
      `
      CREATE (c:Card {
        subject:   $subject,
        text:      $text,
        author:    $author,
        imageUrl:  $imageUrl,
        caption:   $caption,
        tags:      $tags,
        embedding: $embedding
      })
      RETURN elementId(c) AS id, c
      `,
      {
        subject, text,
        author:   req.user.email,
        imageUrl, caption,
        tags:     tags || [],
        embedding
      }
    );
    const newId  = result.records[0].get('id').toNumber
                  ? result.records[0].get('id').toNumber() 
                  : result.records[0].get('id');
    const newCard= result.records[0].get('c').properties;
    newCard._id  = newId;

    await linkByTags(newId, tags || []);

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
      `MATCH (c:Card)
       WHERE elementId(c) = $id AND c.author = $author
       DETACH DELETE c`,
      { id, author: req.user.email }
    );
    if (result.summary.counters.updates().nodesDeleted === 0) {
      return res.status(404).json({ error: 'Card not found or unauthorized' });
    }
    res.status(200).json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error("Error deleting card:", error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};

exports.duplicateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email;
    const origRes = await session.run(
      `MATCH (c:Card) WHERE elementId(c) = $id RETURN c`,
      { id }
    );
    if (!origRes.records.length) {
      return res.status(404).json({ error: 'Card not found' });
    }
    const orig = origRes.records[0].get('c').properties;
    if (orig.author !== userEmail) {
      return res.status(403).json({ error: 'Only owner can duplicate' });
    }
    const tags = orig.tags || [];
    const embedding = Array.isArray(orig.embedding) ? orig.embedding : [];

    const result = await session.run(
      `
      CREATE (c:Card {
        subject:   $subject,
        text:      $text,
        author:    $author,
        imageUrl:  $imageUrl,
        caption:   $caption,
        tags:      $tags,
        embedding: $embedding
      })
      RETURN elementId(c) AS id, c
      `,
      {
        subject: orig.subject + ' (Copy)',
        text:    orig.text,
        author:  orig.author,
        imageUrl:orig.imageUrl,
        caption: orig.caption,
        tags,
        embedding
      }
    );
    const newId   = result.records[0].get('id').toNumber
                  ? result.records[0].get('id').toNumber() 
                  : result.records[0].get('id');
    const newCard = result.records[0].get('c').properties;
    newCard._id   = newId;

    await linkByTags(newId, tags);

    res.status(201).json(newCard);
  } catch (error) {
    console.error("Error duplicating card:", error);
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
      `MATCH (c:Card) WHERE elementId(c) = $id RETURN c`,
      { id }
    );
    if (!cardRes.records.length) {
      return res.status(404).json({ error: 'Card not found' });
    }
    const reportData = JSON.stringify({
      email, reportType, additionalInfo, timestamp: Date.now()
    });
    await session.run(
      `
      MATCH (c:Card) WHERE elementId(c) = $id
      SET c.reports = coalesce(c.reports, []) + $reportData
      `,
      { id, reportData }
    );
    res.status(200).json({ message: `Report added to Card ${id}` });
  } catch (error) {
    console.error("Error reporting card:", error);
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
        imgBuf = Buffer.from(imageUrl.split(',')[1], 'base64');
      } else {
        const resp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        imgBuf = Buffer.from(resp.data);
      }
      const { data: rgb, info } = await sharp(imgBuf)
        .resize(224,224)
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const inputT = tf.tensor3d(rgb, [info.height, info.width, info.channels], 'int32');
      const embT   = (await modelPromise).infer(inputT, true);
      const rawEmb = await embT.array();
      inputT.dispose(); embT.dispose();
      embedding   = Array.isArray(rawEmb) ? rawEmb.flat(Infinity) : rawEmb;
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
      `
      MATCH (c:Card)
      WHERE elementId(c) = $id AND c.author = $author
      SET ${sets.join(',\n          ')}
      RETURN c
      `,
      { id, author: userEmail, subject, text, imageUrl, caption, tags: tags||[], embedding }
    );
    if (!result.records.length) {
      return res.status(404).json({ error: 'Card not found or unauthorized' });
    }

    await session.run(
      `
      // first remove existing HAS_TAG edges
      MATCH (c:Card)-[r:HAS_TAG]->() 
      WHERE elementId(c) = $id
      DELETE r
      `,
      { id }
    );
    await linkByTags(id, tags || []);

    res.status(200).json(result.records[0].get('c').properties);
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: 'Failed to update card' });
  }
};
