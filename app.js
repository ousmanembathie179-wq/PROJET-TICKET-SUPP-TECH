const db = require('./db'); // Importe le fichier db.js que l'on vient de créer
const express = require('express');
const app = express();
const port = 3000;
const session = require('express-session');

// C'est cette partie qui crée et maintient la session
app.use(session({
    secret: 'cle_secrete_super_complexe', // Change ce texte par ce que tu veux
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Mets 'true' uniquement si tu es en HTTPS
}));

// On dit à Node.js d'utiliser EJS pour les pages web
app.set('view engine', 'ejs');

// On lui dit que le CSS et les images sont dans le dossier 'public'
app.use(express.static('public'));

// Configuration pour lire les données des formulaires (POST)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ROUTE 1 : Afficher la page de connexion au départ (sans erreur)
app.get('/', (req, res) => {
    res.render('connexion', { error: null }); 
});

// 2. ROUTES ESPACE EMPLOYÉ
app.get('/employe/Tableaubord', (req, res) => {
    const id_auteur = req.session.userId;
    if (!id_auteur) return res.redirect('/');

    // 1. On récupère le mot tapé dans la barre de recherche
    const searchTerm = req.query.search || ''; 

    // 2. On adapte la requête SQL avec un "AND T.titre LIKE ?"
    const query = `
        SELECT T.id_ticket, T.titre, T.date_creation, 
               S.libelle_statut, P.libelle_priorite
        FROM TICKET T
        JOIN STATUT S ON T.id_statut = S.id_statut
        JOIN PRIORITE P ON T.id_priorite = P.id_priorite
        WHERE T.id_auteur = ? AND T.titre LIKE ?
    `;

    // Le '%' permet de chercher le mot n'importe où dans le titre
    const sqlSearch = `%${searchTerm}%`;

    db.query(query, [id_auteur, sqlSearch], (err, tickets) => {
        if (err) throw err;
        // On passe searchQuery à la vue pour que l'input garde le texte
        res.render('TableaubordEmployé', { listeTickets: tickets, searchQuery: searchTerm });
    });
});

app.get('/employe/Nouveau-Ticket', (req, res) => {
    res.render('Nouveau-TicketEmployé');
});

app.get('/technicien/Nouveau-Ticket', (req, res) => {
    res.render('Nouveau-TicketTech');
});

app.get('/employe/InfoTicket', (req, res) => {
    res.render('InfoTicketEmployé');
});

// 3. ROUTES ESPACE TECHNICIEN
app.get('/technicien/Tableaubord', (req, res) => {
    const searchTerm = req.query.search || '';

    const query = `
        SELECT T.id_ticket, T.titre, T.date_creation, 
               S.libelle_statut, P.libelle_priorite,
               U.nom AS auteur_nom, U.prenom AS auteur_prenom
        FROM TICKET T
        JOIN STATUT S ON T.id_statut = S.id_statut
        JOIN PRIORITE P ON T.id_priorite = P.id_priorite
        JOIN UTILISATEUR U ON T.id_auteur = U.id_user
        WHERE T.titre LIKE ?
    `;

    const sqlSearch = `%${searchTerm}%`;

    db.query(query, [sqlSearch], (err, tickets) => {
        if (err) throw err;
        res.render('TableaubordTech', { listeTickets: tickets, searchQuery: searchTerm });
    });
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

// Traitement du formulaire de connexion
app.post('/', (req, res) => {
    const { email, password } = req.body;

    // Requête SQL (adapte "email" et "mdp" avec tes vrais noms validés juste avant)
    const query = 'SELECT * FROM UTILISATEUR WHERE email = ? AND mot_passe = ?';

    db.query(query, [email, password], (err, results) => {
        if (err) {
            console.error("Erreur lors de la connexion :", err);
            return res.render('Connexion', { error: "Une erreur est survenue." });
        }

        // Si l'utilisateur existe
        if (results.length > 0) {
            const user = results[0];
            req.session.userId = user.id_user;
            console.log(`Utilisateur connecté : ${user.nom_user} (Rôle ID: ${user.id_role})`);

            // 1. Redirection dynamique selon le rôle
            // (Met l'ID correspondant à tes rôles : par exemple 1 pour Tech, 2 pour Employé)
            if (user.id_role === 1) { 
                return res.redirect('/employe/Tableaubord'); // Adapte l'URL de ton choix pour l'employé
            } else {
                return res.redirect('/technicien/Tableaubord'); // Adapte l'URL de ton choix pour le technicien
            }

        } else {
            // 2. Si les identifiants sont incorrects, on réaffiche la page de connexion
            // en lui passant une variable "error"
            res.render('Connexion', { error: "Email ou mot de passe incorrect." });
        }
    });
});

app.post('/employe/Nouveau-Ticket', (req, res) => {
    const { titre, descriptions, id_priorite } = req.body;
    const id_auteur = req.session.userId; // Récupère l'ID réel
    const id_statut = 1;

    const sql = `INSERT INTO TICKET (titre, descriptions, id_auteur, id_statut, id_priorite, date_creation) 
                 VALUES (?, ?, ?, ?, ?, NOW())`;
    
    db.query(sql, [titre, descriptions, id_auteur, id_statut, id_priorite], (err, result) => {
        if (err) throw err;
        res.redirect('/employe/Tableaubord');
    });
});

app.post('/technicien/Nouveau-Ticket', (req, res) => {
    // Récupération des données du formulaire (nomme tes champs input dans ton HTML)
    const { titre, descriptions, id_priorite } = req.body;
    const id_auteur = req.session.userId; // L'ID de l'employé connecté (à remplacer plus tard par une session)
    const id_statut = 1; // 1 = "Ouvert" par défaut
    const date_creation = new Date();

    const sql = "INSERT INTO TICKET (titre, descriptions, id_priorite, id_statut, id_auteur, date_creation) VALUES (?, ?, ?, ?, ?, ?)";
    
    db.query(sql, [titre, descriptions, id_priorite, id_statut, id_auteur, date_creation], (err, result) => {
        if (err) throw err;
        // Une fois inséré, on redirige vers le tableau de bord pour voir le nouveau ticket
        res.redirect('/technicien/Tableaubord');
    });
});

app.post('/supprimer-tickets', (req, res) => {
    // req.body.id_ticket est un tableau d'IDs
    const ids = req.body.id_ticket; 

    if (!ids) return res.redirect('/employe/Tableaubord');

    // On utilise la clause IN pour supprimer plusieurs lignes d'un coup
    const sql = "DELETE FROM TICKET WHERE id_ticket IN (?)";
    
    db.query(sql, [ids], (err, result) => {
        if (err) throw err;
        res.redirect('/employe/Tableaubord'); // Retourne à la page précédente
    });
});

app.post('/supprimer-tickets-tech', (req, res) => {
    // req.body.id_ticket est un tableau d'IDs
    const ids = req.body.id_ticket; 

    if (!ids) return res.redirect('/technicien/Tableaubord');

    // On utilise la clause IN pour supprimer plusieurs lignes d'un coup
    const sql = "DELETE FROM TICKET WHERE id_ticket IN (?)";
    
    db.query(sql, [ids], (err, result) => {
        if (err) throw err;
        res.redirect('/technicien/Tableaubord'); // Retourne à la page précédente
    });
});


// Lancement du serveur
app.listen(port, () => {
    console.log(`🚀 Application lancée sur http://localhost:${port}`);
});