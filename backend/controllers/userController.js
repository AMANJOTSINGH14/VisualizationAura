const { session } = require('../config/neo4j');

const googleLogin = async (req, res) => {
  try {
    const { email, name, uid } = req.user;
    
    let result = await session.run(
      `MATCH (u:User {email: $email}) RETURN u`,
      { email }
    );

    if (result.records.length === 0) {
      result = await session.run(
        `CREATE (u:User {email: $email, name: $name, googleId: $googleId}) RETURN u`,
        { email, name, googleId: uid }
      );
    }

    const user = result.records[0].get('u').properties;
    res.json({ message: 'Google Login Successful', user });
  } catch (error) {
    res.status(500).json({ message: 'Google Login Failedn', error: error.message });
  }
};

module.exports = { googleLogin };
