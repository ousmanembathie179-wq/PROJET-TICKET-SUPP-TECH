const mysql = require('mysql2');

// Création de la connexion avec les identifiants locaux par défaut
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',      // 'root' par défaut sur Wamp/XAMPP
    password: '',      // Vide par défaut sur Wamp/XAMPP (si tu es sur Mac/MAMP, mets 'root')
    database: 'projet_tickets' // Le nom de la base de données de ton script SQL
});

// Tester si la connexion fonctionne
connection.connect((err) => {
    if (err) {
        console.error('❌ Erreur de connexion à MySQL :', err.message);
        return;
    }
    console.log('✅ Connexion à la base de données MySQL réussie !');
});

// On exporte la connexion pour pouvoir l'utiliser dans app.js
module.exports = connection;