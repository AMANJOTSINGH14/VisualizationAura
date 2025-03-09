const { session } = require('../config/neo4j');

exports.getAllCards = async (req, res) => {
  console.log("📥 Fetching all cards...");
  try {
    const result = await session.run(`MATCH (c:Card) RETURN elementId(c) AS id, c`);
    
    const cards = result.records.map(record => {
      let card = record.get('c').properties;
      card._id = record.get('id'); // Attach unique ID
      return card;
    });

    res.status(200).json(cards);
  } catch (error) {
    console.error("❌ Error fetching cards:", error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
};

exports.createCard = async (req, res) => {
  const { subject, text, imageUrl, caption, tags } = req.body;
  try {
    const result = await session.run(
      `CREATE (c:Card {subject: $subject, text: $text, author: $author, imageUrl: $imageUrl, caption: $caption, tags: $tags}) 
       RETURN elementId(c) AS id, c`,
      { subject, text, author: req.user.email, imageUrl, caption, tags }
    );

    const newCard = result.records[0].get('c').properties;
    newCard._id = result.records[0].get('id'); // Attach unique ID

    res.status(201).json(newCard);
  } catch (error) {
    console.error("❌ Error creating card:", error);
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

    res.status(200).json({ message: '✅ Card deleted successfully' });
  } catch (error) {
    console.error("❌ Error deleting card:", error);
    res.status(500).json({ error: 'Failed to delete card' });
  }
};

exports.duplicateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const userEmail = req.user.email; 

    // Find the original card
    const originalResult = await session.run(
      `MATCH (c:Card) WHERE elementId(c) = $id RETURN c`,
      { id }
    );

    if (originalResult.records.length === 0) {
      return res.status(404).json({ error: 'Card not found' });
    }

    const originalCard = originalResult.records[0].get('c').properties;

    // 🔥 Check if the authenticated user is the owner
    if (originalCard.author !== userEmail) {
      return res.status(403).json({ error: 'Unauthorized: Only the owner can duplicate this card' });
    }

    // Create a duplicate
    const result = await session.run(
      `CREATE (c:Card {subject: $subject, text: $text, author: $author, imageUrl: $imageUrl, caption: $caption, tags: $tags}) 
       RETURN elementId(c) AS id, c`,
      {
        subject: originalCard.subject + " (Copy)",
        text: originalCard.text,
        author: originalCard.author, // Keep the original author
        imageUrl: originalCard.imageUrl,
        caption: originalCard.caption,
        tags: originalCard.tags,
      }
    );

    const newCard = result.records[0].get('c').properties;
    newCard._id = result.records[0].get('id');

    res.status(201).json(newCard);
  } catch (error) {
    console.error("❌ Error duplicating card:", error);
    res.status(500).json({ error: 'Failed to duplicate card' });
  }
};

exports.reportCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, reportType, additionalInfo } = req.body;

    console.log("Received data:", { email, reportType, additionalInfo });
    if (!id || !email || !reportType || !additionalInfo) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Check if the card node exists
    const cardResult = await session.run(
      `MATCH (c:Card) WHERE elementId(c) = $id RETURN c`,
      { id }
    );

    if (cardResult.records.length === 0) {
      return res.status(404).json({ error: "Card not found" });
    }

    // 🔥 Convert your fields to a single JSON string
    const reportData = JSON.stringify({
      email,
      reportType,
      additionalInfo,
      timestamp: Date.now()
    });

    // 🔥 Store an array of strings (JSON) in c.reports
    await session.run(
      `MATCH (c:Card)
       WHERE elementId(c) = $id
       SET c.reports = COALESCE(c.reports, []) + [$reportData]`,
      { id, reportData }
    );

    res.status(200).json({ message: `✅ Report added to Card ${id}` });
  } catch (error) {
    console.error("❌ Error reporting card:", error);
    res.status(500).json({ error: "Failed to report card" });
  }
};

exports.updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject, text, imageUrl, caption } = req.body;
    const userEmail = req.user.email; // Authenticated user's email

    // 1) Match the card by elementId + check ownership
    const result = await session.run(
      `
      MATCH (c:Card)
      WHERE elementId(c) = $id AND c.author = $author
      SET c.subject = $subject,
          c.text = $text,
          c.imageUrl = $imageUrl,
          c.caption = $caption
      RETURN c
      `,
      {
        id,
        author: userEmail,
        subject,
        text,
        imageUrl,
        caption,
        
      }
    );

    // 2) If no card matched (either not found or not owned by user)
    if (result.records.length === 0) {
      return res.status(404).json({ error: 'Card not found or unauthorized' });
    }

    // 3) Return the updated card
    const updatedCardProps = result.records[0].get('c').properties;
    return res.status(200).json(updatedCardProps);

  } catch (error) {
    console.error("❌ Error updating card:", error);
    return res.status(500).json({ error: 'Failed to update card' });
  }
};

