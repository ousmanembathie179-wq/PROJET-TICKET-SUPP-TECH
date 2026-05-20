const db = require('./db'); // Importe le fichier db.js que l'on vient de créer
const express = require('express');
const app = express();
const port = 3000;

// On dit à Node.js d'utiliser EJS pour les pages web
app.set('view engine', 'ejs');

// On lui dit que le CSS et les images sont dans le dossier 'public'
app.use(express.static('public'));

// ROUTE 1 : Afficher la page de connexion
app.get('/', (req, res) => {
    res.render('connexion'); // Node va chercher 'connexion.ejs' dans le dossier 'views'
});

// 2. ROUTES ESPACE EMPLOYÉ
app.get('/employe/Tabeaubord', (req, res) => {
    res.render('TableaubordEmployé'); 
});

app.get('/employe/Nouveau-Ticket', (req, res) => {
    res.render('Nouveau-Ticket'); 
});

app.get('/employe/InfoTicket', (req, res) => {
    res.render('InfoTicketEmployé'); 
});

// 3. ROUTES ESPACE TECHNICIEN
app.get('/technicien/Tableaubord', (req, res) => {
    res.render('TableaubordTech'); 
});

app.get('/technicien/InfoTicket', (req, res) => {
    res.render('InfoTicketTech'); 
});


app.get('/admin/utilisateurs', (req, res) => {
    res.render('GestionUtilisateur'); 
});

app.get('/admin/ajouter-utilisateur', (req, res) => {
    res.render('Nouveau-Utilisateur'); 
});


// Lancement du serveur
app.listen(port, () => {
    console.log(`🚀 Application lancée sur http://localhost:${port}`);
});