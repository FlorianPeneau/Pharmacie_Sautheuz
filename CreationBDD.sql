-- Création de la base de données
CREATE DATABASE IF NOT EXISTS pharmacie_db;
USE pharmacie_db;

-- Définition du moteur par défaut
SET default_storage_engine = InnoDB;

-- Création de la table clients
CREATE TABLE IF NOT EXISTS clients (
    id_client INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    annee_naissance INT(4) NOT NULL,
    num_secu_sociale VARCHAR(15) UNIQUE NOT NULL,
    mutuelle_nom VARCHAR(100),
    mutuelle_numero VARCHAR(20),
    UNIQUE KEY unique_num_secu_sociale (num_secu_sociale)
) ENGINE=InnoDB;

-- Création de la table medecins
CREATE TABLE IF NOT EXISTS medecins (
    id_medecin INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    numero_licence VARCHAR(15) UNIQUE NOT NULL,
    ordre_des_medecins_licence VARCHAR(20) NOT NULL,
    telephone VARCHAR(15),
    email VARCHAR(100) UNIQUE NOT NULL,
    UNIQUE KEY unique_numero_licence (numero_licence),
    UNIQUE KEY unique_email (email)
) ENGINE=InnoDB;

-- Création de la table medicaments
CREATE TABLE IF NOT EXISTS medicaments (
    id_medicament INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    posologie VARCHAR(255) NOT NULL,
    stock INT NOT NULL
) ENGINE=InnoDB;

-- Création de la table ordonnances
CREATE TABLE IF NOT EXISTS ordonnances (
    id_ordonnance INT PRIMARY KEY AUTO_INCREMENT,
    id_client INT,
    id_medecin INT,
    date_creation DATE NOT NULL,
    duree_traitement INT NOT NULL,
    id_medicament INT NOT NULL,
    FOREIGN KEY (id_client) REFERENCES clients(id_client),
    FOREIGN KEY (id_medecin) REFERENCES medecins(id_medecin),
    FOREIGN KEY (id_medicament) REFERENCES medicaments(id_medicament)
) ENGINE=InnoDB;

-- Insertion de données d'exemple
INSERT INTO clients (nom, prenom, annee_naissance, num_secu_sociale, mutuelle_nom, mutuelle_numero)
VALUES 
    ('Dupont', 'Jean', 1980, '123456789012345', 'MutuelleA', 'A123456'),
    ('Martin', 'Sophie', 1992, '987654321098765', 'MutuelleB', 'B654321'),
    ('Lefevre', 'Pierre', 1975, '456789012345678', 'MutuelleC', 'C789012'),
    ('Leroy', 'Isabelle', 1988, '345678901234567', 'MutuelleD', 'D567890'),
    ('Girard', 'Marie', 2000, '234567890123456', 'MutuelleE', 'E456789'),
    ('Lambert', 'Luc', 1983, '567890123456789', 'MutuelleF', 'F345678'),
    ('Fournier', 'Anne', 1995, '678901234567890', 'MutuelleG', 'G234567'),
    ('Roux', 'Philippe', 1972, '789012345678901', 'MutuelleH', 'H123456'),
    ('Dubois', 'Catherine', 1986, '890123456789012', 'MutuelleI', 'I012345'),
    ('Marchand', 'Michel', 1998, '901234567890123', 'MutuelleJ', 'J901234');

INSERT INTO medecins (nom, prenom, numero_licence, ordre_des_medecins_licence, telephone, email)
VALUES 
    ('Martin', 'David', '12345', 'A12345', '0123456789', 'david.martin@email.com'),
    ('Lefevre', 'Sophie', '67890', 'B67890', '0987654321', 'sophie.lefevre@email.com'),
    ('Leroy', 'Paul', '34567', 'C34567', '0654321098', 'paul.leroy@email.com'),
    ('Girard', 'Emma', '89012', 'D89012', '0213456789', 'emma.girard@email.com'),
    ('Lambert', 'Louis', '45678', 'E45678', '0876543210', 'louis.lambert@email.com'),
    ('Fournier', 'Julie', '23456', 'F23456', '0543210987', 'julie.fournier@email.com'),
    ('Roux', 'Claude', '78901', 'G78901', '0432109876', 'claude.roux@email.com'),
    ('Dubois', 'Marie', '01234', 'H01234', '0321098765', 'marie.dubois@email.com'),
    ('Marchand', 'Luc', '56789', 'I56789', '0765432109', 'luc.marchand@email.com'),
    ('Dupont', 'Celine', '90123', 'J90123', '0987654321', 'celine.dupont@email.com');

INSERT INTO medicaments (nom, posologie, stock)
VALUES 
    ('Aspirine', '1 comprimé par jour', 100),
    ('Paracétamol', '2 comprimés toutes les 6 heures', 50),
    ('Ibuprofène', '1 comprimé toutes les 8 heures', 75),
    ('Amoxicilline', '1 comprimé deux fois par jour', 30),
    ('Omeprazole', '1 comprimé avant le petit déjeuner', 20),
    ('Lévothyroxine', '1 comprimé par jour à jeun', 25),
    ('Diazepam', '1 comprimé au coucher', 15),
    ('Atorvastatin', '1 comprimé par jour', 40),
    ('Losartan', '1 comprimé par jour', 30),
    ('Salbutamol', 'Inhalation selon besoin', 10);

INSERT INTO ordonnances (id_client, id_medecin, date_creation, duree_traitement, id_medicament)
VALUES 
    (1, 1, '2023-01-01', 30, 1),
    (2, 2, '2023-02-01', 15, 2),
    (3, 3, '2023-03-01', 20, 3),
    (4, 4, '2023-04-01', 25, 4),
    (5, 5, '2023-05-01', 10, 5),
    (6, 6, '2023-06-01', 15, 6),
    (7, 7, '2023-07-01', 30, 7),
    (8, 8, '2023-08-01', 25, 8),
    (9, 9, '2023-09-01', 20, 9),
    (10, 10, '2023-10-01', 15, 10);