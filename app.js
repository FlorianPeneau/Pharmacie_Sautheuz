// app.js
const express = require('express');
const mysql = require('mysql2');
const ejs = require('ejs');
const app = express();
app.use(express.urlencoded({ extended: true }));
const port = 3000;

// Moteur de modèle EJS
app.set('view engine', 'ejs');

// Configuration de la base de données
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pharmacie_db'
  });
  
// Connexion à la base de données
db.connect((err) => {
    if (err) {
      console.error('Erreur de connexion à la base de données:', err);
    } else {
      console.log('Connexion à la base de données établie');
    }
});

// Définir la route par défaut
app.get('/', (req, res) => {
  res.render('accueil');
});

// Route pour l'affichage de la liste des clients
app.get('/client', (req, res) => {
    // Récupération des données de la table
    db.query('SELECT * FROM clients', (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des données:', err);
        res.status(500).send('Erreur interne du serveur');
      } else {
        res.render('client', { clients: results });
      }
    });
  });

// Route pour afficher le formulaire d'ajout
app.get('/client/ajouter', (req, res) => {
  res.render('ajouter_client');
});

// Route pour traiter le formulaire d'ajout
app.post('/client/ajouter', (req, res) => {
  const { nom_client, prenom, annee_naissance, num_secu_sociale, mutuelle_nom, mutuelle_numero } = req.body;

  // Vérifier si tous les champs sont remplis
  if (!nom_client || !prenom || !annee_naissance || !num_secu_sociale || !mutuelle_nom || !mutuelle_numero) {
    return res.status(400).send('Tous les champs doivent être remplis.');
  }

  // Insérez les données dans la base de données
  db.query('INSERT INTO clients (nom, prenom, annee_naissance, num_secu_sociale, mutuelle_nom, mutuelle_numero) VALUES (?, ?, ?, ?, ?, ?)',
    [nom_client, prenom, annee_naissance, num_secu_sociale, mutuelle_nom, mutuelle_numero],
    (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'ajout des données:', err);
        res.status(500).send('Erreur interne du serveur');
      } else {
        console.log('Données ajoutées avec succès.');
        // Redirigez l'utilisateur vers la page client après l'ajout
        res.redirect('/client');
      }
    });
});

// Route pour supprimer un client
app.post('/client/supprimer/:id', (req, res) => {
  const clientId = req.params.id;

  // Supprimez les données de la base de données
  db.query('DELETE FROM clients WHERE id_client = ?', [clientId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression des données:', err);
      res.status(500).send('Ce client ne peut pas être supprimé car il est possède une ordonnance.');
    } else {
      console.log('Données supprimées avec succès.');
      // Redirigez l'utilisateur vers la page client après la suppression
      res.redirect('/client');
    }
  });
});

// Route pour afficher le formulaire de modification
app.get('/client/modifier/:id', (req, res) => {
  const clientId = req.params.id;

  // Récupérez les données du client depuis la base de données en utilisant l'ID
  db.query('SELECT * FROM clients WHERE id_client = ?', [clientId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données du client:', err);
      res.status(500).send('Erreur interne du serveur');
    } else {
      // Affichez la vue modifier_client avec les données du client
      res.render('modifier_client', { client: results[0] });
    }
  });
});

// Route pour traiter le formulaire de modification
app.post('/client/modifier/:id', (req, res) => {
  const clientId = req.params.id;
  const { nom, prenom, annee_naissance, num_secu_sociale, mutuelle_nom, mutuelle_numero } = req.body;

  // Mettez à jour les données du client dans la base de données
  db.query('UPDATE clients SET nom = ?, prenom = ?, annee_naissance = ?, num_secu_sociale = ?, mutuelle_nom = ?, mutuelle_numero = ? WHERE id_client = ?',
    [nom, prenom, annee_naissance, num_secu_sociale, mutuelle_nom, mutuelle_numero, clientId],
    (err, results) => {
      if (err) {
        console.error('Erreur lors de la mise à jour des données du client:', err);
        res.status(500).send('Erreur interne du serveur');
      } else {
        console.log('Données du client mises à jour avec succès.');
        // Redirigez l'utilisateur vers la page client après la modification
        res.redirect('/client');
      }
    });
});

// Route pour afficher la vue ordonnance avec les médicaments associés
app.get('/client/ordonnance/:id', (req, res) => {
  const clientId = req.params.id;

  // Utilisation de la requête SQL pour compter les ordonnances associées au client
  const sql = 'SELECT COUNT(*) AS count_ordonnances FROM ordonnances WHERE id_client = ?';
  
  db.query(sql, [clientId], (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Erreur lors de la vérification des ordonnances du client');
      return;
    }

    const aDesOrdonnances = results[0].count_ordonnances > 0;

    if (aDesOrdonnances) {

    // Récupérez les données d'ordonnance et de médicaments depuis la base de données
    db.query(
      'SELECT o.id_ordonnance, o.id_medecin, o.date_creation, o.duree_traitement, m.nom, m.posologie FROM ordonnances o ' +
      'LEFT JOIN medicaments m ON o.id_medicament = m.id_medicament ' +
      'WHERE o.id_client = ?',
      [clientId],
      (err, results) => {
        if (err) {
          console.error('Erreur lors de la récupération des données d\'ordonnance et de médicaments:', err);
          res.status(500).send('Erreur interne du serveur');
        } else {
          // Affichez la vue ordonnance avec les données d'ordonnance et de médicaments
          res.render('ordonnance', { ordonnanceData: results });
        }
      }
    )
    } else {
      // Le client n'a pas d'ordonnance, redirigez vers la vue d'ajout d'ordonnance
      res.redirect(`/client/ajouter_ordonnance/${clientId}`);
    }
  })
});

// Route pour l'ajout d'ordonnance
app.get('/client/ajouter_ordonnance/:id_client', (req, res) => {
  const clientId = req.params.id_client;

  // Récupération des médecins depuis la table medecins
  db.query('SELECT id_medecin, nom FROM medecins', (errMedecins, medecins) => {
    if (errMedecins) {
      console.error('Erreur lors de la récupération des médecins:', errMedecins);
      res.status(500).send('Erreur interne du serveur');
      return;
    }

    // Récupération des médicaments depuis la table medicaments
    db.query('SELECT id_medicament, nom FROM medicaments', (errMedicaments, medicaments) => {
      if (errMedicaments) {
        console.error('Erreur lors de la récupération des médicaments:', errMedicaments);
        res.status(500).send('Erreur interne du serveur');
        return;
      }
      
      res.render('ajouter_ordonnance', { clientId, medecins, medicaments });
    });
  });
});

// Route pour traiter le formulaire d'ajout d'ordonnance
app.post('/client/ajouter_ordonnance/:id_client', (req, res) => {
  const { medecin, medicament, date_creation, duree_traitement } = req.body;
  const clientId = req.params.id_client;

  // Vérifier si tous les champs sont remplis
  if (!clientId || !medecin || !medicament || !date_creation || !duree_traitement) {
    return res.status(400).send('Tous les champs doivent être remplis.');
  }

  // Insérez les données dans la base de données
  db.query('INSERT INTO ordonnances (id_client, id_medecin, date_creation, duree_traitement, id_medicament) VALUES (?, ?, ?, ?, ?)',
    [clientId, medecin, date_creation, duree_traitement, medicament],
    (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'ajout des données:', err);
        res.status(500).send('Erreur interne du serveur');
      } else {
        console.log('Données ajoutées avec succès.');
        // Redirigez l'utilisateur vers la page client après l'ajout
        res.redirect('/client');
      }
    });
});

// Route pour supprimer une ordonnance
app.post('/client/supprimer_ordonnance/:id_ordonnance', (req, res) => {
  const id_ordonnance = req.params.id_ordonnance;

  // Supprimez l'ordonnance de la base de données
  db.query('DELETE FROM ordonnances WHERE id_ordonnance = ?', [id_ordonnance], (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression de l\'ordonnance:', err);
      res.status(500).send('Erreur interne du serveur');
    } else {
      console.log('Ordonnance supprimée avec succès.');
      // Redirigez l'utilisateur vers la page client après la suppression
      res.redirect('/client');
    }
  });
});

// Route vers la page stock
app.get('/stock', (req, res) => {
    
    // Récupération des données de la table
    db.query('SELECT * FROM medicaments', (err, results) => {
      if (err) {
        console.error('Erreur lors de la récupération des données:', err);
        res.status(500).send('Erreur interne du serveur');
      } else {
        res.render('stock', { medicaments: results });
      }
    });
  });

// Route pour supprimer un médicament
app.post('/stock/supprimer/:id', (req, res) => {
  const medicamentId = req.params.id;

  // Supprimez les données de la base de données
  db.query('DELETE FROM medicaments WHERE id_medicament = ?', [medicamentId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la suppression des données:', err);
      res.status(500).send('Erreur interne du serveur');
    } else {
      console.log('Données supprimées avec succès.');
      // Redirigez l'utilisateur vers la page stock après la suppression
      res.redirect('/stock');
    }
  });
});
  
// Route pour afficher le formulaire d'ajout
app.get('/stock/ajouter', (req, res) => {
  res.render('ajouter_medicament');
});

// Route pour traiter le formulaire d'ajout
app.post('/stock/ajouter', (req, res) => {
  const { nom_medicament, posologie, stock } = req.body;

  // Vérifier si tous les champs sont remplis
  if (!nom_medicament || !posologie || !stock) {
    return res.status(400).send('Tous les champs doivent être remplis.');
  }

  // Insérez les données dans la base de données
  db.query('INSERT INTO medicaments (nom, posologie, stock) VALUES (?, ?, ?)',
    [nom_medicament, posologie, stock],
    (err, results) => {
      if (err) {
        console.error('Erreur lors de l\'ajout des données:', err);
        res.status(500).send('Erreur interne du serveur');
      } else {
        console.log('Données ajoutées avec succès.');
        // Redirigez l'utilisateur vers la page stock après l'ajout
        res.redirect('/stock');
      }
    });
});

// Route pour afficher le formulaire de modification
app.get('/stock/modifier/:id', (req, res) => {
  const medicamentId = req.params.id;

  // Récupérez les données du médicament depuis la base de données en utilisant l'ID
  db.query('SELECT * FROM medicaments WHERE id_medicament = ?', [medicamentId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des données du médicament:', err);
      res.status(500).send('Erreur interne du serveur');
    } else {
      // Affichez la vue modifier_medicament avec les données du médicament
      res.render('modifier_medicament', { medicament: results[0] });
    }
  });
});

// Route pour traiter le formulaire de modification
app.post('/stock/modifier/:id', (req, res) => {
  const medicamentId = req.params.id;
  const { nom_medicament, posologie, stock } = req.body;

  // Vérifier si tous les champs sont remplis
  if (!nom_medicament || !posologie || !stock) {
    return res.status(400).send('Tous les champs doivent être remplis.');
  }

  // Mettez à jour les données du client dans la base de données
  db.query('UPDATE medicaments SET nom = ?, posologie = ?, stock = ? WHERE id_medicament = ?',
    [nom_medicament, posologie, stock, medicamentId],
    (err, results) => {
      if (err) {
        console.error('Erreur lors de la mise à jour des données du médicament:', err);
        res.status(500).send('Erreur interne du serveur');
      } else {
        console.log('Données du médicament mises à jour avec succès.');
        // Redirigez l'utilisateur vers la page stock après la modification
        res.redirect('/stock');
      }
    });
});


// Gestion des erreurs 404
app.use((req, res) => {
    res.status(404).send('Page non trouvée');
  });
  
// Écoute du serveur sur le port spécifié
app.listen(port, () => {
    console.log(`Le serveur est en cours d'exécution sur http://localhost:${port}`);
  });