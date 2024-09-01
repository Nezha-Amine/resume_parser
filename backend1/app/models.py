from flask_pymongo import PyMongo
from werkzeug.security import generate_password_hash, check_password_hash
from pymongo.collection import Collection
from typing import Optional
import re
from bson.json_util import dumps

competences_synonymes = {
    # Informatique
    "JavaScript": ["js", "javascript", "ES6", "ECMAScript"],
    "Python": ["python", "py"],
    "Java": ["java", "java SE", "java EE"],
    "C++": ["cpp", "c plus plus", "c++"],
    "C#": ["csharp", "c#"],
    "Ruby": ["ruby", "rails"],
    "PHP": ["php"],
    "Swift": ["swift"],
    "Kotlin": ["kotlin"],
    "TypeScript": ["ts", "typescript"],
    "R": ["r"],
    "MATLAB": ["matlab"],
    "Développement Web": ["web", "frontend", "développement web", "conception web"],
    "HTML": ["html", "langage de balisage hypertexte"],
    "CSS": ["css", "feuilles de style en cascade"],
    "Frameworks JavaScript": ["react", "react.js", "angular", "angular.js", "vue", "vue.js", "ember", "backbone"],
    "Conception Web": ["ux", "ui", "expérience utilisateur", "interface utilisateur"],
    "SQL": ["sql", "langage de requête structuré", "mysql", "postgres", "postgresql"],
    "NoSQL": ["nosql", "mongodb", "cassandra", "redis", "dynamodb"],
    "Systèmes de Gestion de Bases de Données (SGBD)": ["sgbd", "oracle", "sql server", "sqlite", "mongodb"],
    "DevOps": ["devops", "intégration continue", "ci", "déploiement continu", "cd", "livraison continue"],
    "Outils": ["docker", "kubernetes", "jenkins", "git", "github", "gitlab", "bitbucket"],
    "Infrastructure as Code": ["terraform", "ansible", "chef", "puppet"],
    "Plateformes Cloud": ["aws", "amazon web services", "azure", "google cloud", "gcp", "plateforme cloud google", "ibm cloud"],
    "Services Cloud": ["s3", "ec2", "lambda", "fonctions cloud", "cloud run"],
    "Science des Données": ["science des données", "analyste de données", "scientifique des données", "ds"],
    "Machine Learning": ["apprentissage automatique", "ml", "apprentissage profond", "ai", "intelligence artificielle"],
    "Outils et Bibliothèques": ["pandas", "numpy", "scikit-learn", "tensorflow", "keras", "pytorch", "jupyter", "notebooks"],
    "Réseaux": ["réseaux", "ingénieur réseau", "administrateur réseau", "technicien réseau", "administration réseau", "infrastructure réseau"],
    "Protocoles Réseau": ["tcp/ip", "udp", "http", "https", "ftp", "smb", "dns", "dhcp"],
    "Technologies Réseau": ["vpn", "vlans", "wi-fi", "routers", "switches"],
    "Sécurité Réseau": ["firewall", "waf", "détection d'intrusion", "prévention d'intrusion", "sécurité réseau", "cryptage réseau", "vpn", "proxy"],
    "Gestion de Projet": ["gestion de projet", "pm", "scrum", "agile", "kanban", "waterfall"],
    "Outils de Gestion de Projet": ["jira", "trello", "asana", "microsoft project"],
    "Administration Système": ["sysadmin", "administrateur système", "linux", "unix", "serveur windows", "administrateur serveur", "it admin"],
    "Design": ["design graphique", "design ux", "design ui", "conception web", "design de logo"],
    "Outils de Design": ["photoshop", "illustrator", "figma", "sketch", "xd"],
    "Intelligence d'Affaires": ["bi", "analyse d'affaires", "visualisation des données"],
    "Outils BI": ["tableau", "powerbi", "looker", "qlik"],
    "Développement Logiciel": ["ingénierie logicielle", "développeur logiciel", "ingénieur logiciel"],
    "Méthodologies": ["agile", "scrum", "waterfall", "devops"],
    "Industrie": ["industrie", "ingénieur industriel", "technicien industriel"],
    "Maintenance": ["maintenance industrielle", "gestion des équipements", "réparation"],
    "Production": ["production", "gestion de la production", "amélioration continue"],
    "Aéronautique": ["aéronautique", "ingénieur aéronautique", "technicien aéronautique"],
    "Maintenance Aéronautique": ["maintenance aéronautique", "réparation d'aéronefs"],
    "Conception Aéronautique": ["conception aéronautique", "aérodynamique", "systèmes avioniques"],
    "Blockchain": ["blockchain", "chaîne de blocs", "cryptomonnaies"],
    "Cryptomonnaies": ["bitcoin", "ethereum", "altcoins"],
    "Contrats Intelligents": ["smart contracts", "contrats intelligents"],
    "IoT": ["iot", "internet des objets", "objets connectés"],
    "Protocoles IoT": ["mqtt", "coap", "zigbee", "bluetooth low energy"],
    "Plateformes IoT": ["aws iot", "azure iot", "google cloud iot"],
    "Robotique": ["robotique", "ingénieur en robotique", "technicien en robotique"],
    "Automatisation": ["automatisation", "systèmes automatisés", "robots industriels"],
    "Contrôle de Robot": ["contrôle de robot", "programmation de robot"],
    "Réalité Virtuelle": ["vr", "réalité virtuelle", "casques vr"],
    "Réalité Augmentée": ["ar", "réalité augmentée", "applications ar"],
    "Outils et Plateformes de VR/AR": ["unity", "unreal engine", "vuforia"],
    "Applications Mobiles": ["développement mobile", "mobile app", "ios", "android", "flutter", "react native"],
    "Langages de Script": ["bash", "shell", "powershell", "perl"],
    "Automatisation des Tests": ["selenium", "junit", "pytest", "cucumber", "testng"],
    "Développement de Jeux": ["développement de jeux", "game dev", "game design", "unity", "unreal engine"],
    "Plateformes de Jeux": ["unity", "unreal engine", "godot", "cryengine"],
    "Réalité Mixte": ["mixed reality", "mr", "réalité mixte"],
    "Développement d'API": ["api", "développement d'api", "rest", "graphql"],
    "Outils d'API": ["postman", "swagger", "api gateway"],
    "Sécurité Informatique": ["cybersécurité", "sécurité informatique", "analyste en sécurité", "sécurité des applications"],
    "Conformité": ["rgpd", "conformité", "audit de sécurité", "normes de sécurité"],
    "Intelligence Artificielle": ["ai", "intelligence artificielle", "automatisation", "algorithmes", "deep learning"],
    "Analytique Avancée": ["analytique avancée", "analyse prédictive", "analyse prescriptive"],
    "Cloud Computing": ["cloud computing", "informatique en nuage", "aws", "azure", "gcp"],
    "Microservices": ["microservices", "architecture microservices", "service-oriented architecture", "soa"],
    "Services Cloud": ["s3", "ec2", "lambda", "fonctions cloud", "cloud run"],
    "Science des Données": ["science des données", "analyste de données", "scientifique des données", "ds"],
    "Machine Learning": ["apprentissage automatique", "ml", "apprentissage profond", "ai", "intelligence artificielle"],
    "Outils et Bibliothèques": ["pandas", "numpy", "scikit-learn", "tensorflow", "keras", "pytorch", "jupyter", "notebooks"],
    "Réseaux": ["réseaux", "ingénieur réseau", "administrateur réseau", "technicien réseau", "administration réseau", "infrastructure réseau"],
    "Protocoles Réseau": ["tcp/ip", "udp", "http", "https", "ftp", "smb", "dns", "dhcp"],
    "Technologies Réseau": ["vpn", "vlans", "wi-fi", "routers", "switches"],
    "Sécurité Réseau": ["firewall", "waf", "détection d'intrusion", "prévention d'intrusion", "sécurité réseau", "cryptage réseau", "vpn", "proxy"],
    "Gestion de Projet": ["gestion de projet", "pm", "scrum", "agile", "kanban", "waterfall"],
    "Outils de Gestion de Projet": ["jira", "trello", "asana", "microsoft project"],
    "Administration Système": ["sysadmin", "administrateur système", "linux", "unix", "serveur windows", "administrateur serveur", "it admin"],
    "Design": ["design graphique", "design ux", "design ui", "conception web", "design de logo"],
    "Outils de Design": ["photoshop", "illustrator", "figma", "sketch", "xd"],
    "Intelligence d'Affaires": ["bi", "analyse d'affaires", "visualisation des données"],
    "Outils BI": ["tableau", "powerbi", "looker", "qlik"],
    "Développement Logiciel": ["ingénierie logicielle", "développeur logiciel", "ingénieur logiciel"],
    "Méthodologies": ["agile", "scrum", "waterfall", "devops"],
    "Industrie": ["industrie", "ingénieur industriel", "technicien industriel"],
    "Maintenance": ["maintenance industrielle", "gestion des équipements", "réparation"],
    "Production": ["production", "gestion de la production", "amélioration continue"],
    "Aéronautique": ["aéronautique", "ingénieur aéronautique", "technicien aéronautique"],
    "Maintenance Aéronautique": ["maintenance aéronautique", "réparation d'aéronefs"],
    "Conception Aéronautique": ["conception aéronautique", "aérodynamique", "systèmes avioniques"],
    "Blockchain": ["blockchain", "chaîne de blocs", "cryptomonnaies"],
    "Cryptomonnaies": ["bitcoin", "ethereum", "altcoins"],
    "Contrats Intelligents": ["smart contracts", "contrats intelligents"],
    "IoT": ["iot", "internet des objets", "objets connectés"],
    "Protocoles IoT": ["mqtt", "coap", "zigbee", "bluetooth low energy"],
    "Plateformes IoT": ["aws iot", "azure iot", "google cloud iot"],
    "Robotique": ["robotique", "ingénieur en robotique", "technicien en robotique"],
    "Automatisation": ["automatisation", "systèmes automatisés", "robots industriels"],
    "Contrôle de Robot": ["contrôle de robot", "programmation de robot"],
    "Réalité Virtuelle": ["vr", "réalité virtuelle", "casques vr"],
    "Réalité Augmentée": ["ar", "réalité augmentée", "applications ar"],
    "Outils et Plateformes de VR/AR": ["unity", "unreal engine", "vuforia"],
    "Applications Mobiles": ["développement mobile", "mobile app", "ios", "android", "flutter", "react native"],
    "Langages de Script": ["bash", "shell", "powershell", "perl"],
    "Automatisation des Tests": ["selenium", "junit", "pytest", "cucumber", "testng"],
    "Développement de Jeux": ["développement de jeux", "game dev", "game design", "unity", "unreal engine"],
    "Plateformes de Jeux": ["unity", "unreal engine", "godot", "cryengine"],
    "Réalité Mixte": ["mixed reality", "mr", "réalité mixte"],
    "Développement d'API": ["api", "développement d'api", "rest", "graphql"],
    "Outils d'API": ["postman", "swagger", "api gateway"],
    "Sécurité Informatique": ["cybersécurité", "sécurité informatique", "analyste en sécurité", "sécurité des applications"],
    "Conformité": ["rgpd", "conformité", "audit de sécurité", "normes de sécurité"],
    "Intelligence Artificielle": ["ai", "intelligence artificielle", "automatisation", "algorithmes", "deep learning"],
    "Analytique Avancée": ["analytique avancée", "analyse prédictive", "analyse prescriptive"],
    "Cloud Computing": ["cloud computing", "informatique en nuage", "aws", "azure", "gcp"],
    "Microservices": ["microservices", "architecture microservices", "service-oriented architecture", "soa"],
    # Gestion
    "Gestion des Ressources Humaines": ["rh", "gestion des ressources humaines", "recrutement", "formation"],
    "Gestion Financière": ["finance", "gestion financière", "comptabilité", "analyse financière"],
    "Gestion de la Chaîne d'Approvisionnement": ["supply chain", "gestion de la chaîne d'approvisionnement", "logistique"],
    "Gestion des Projets": ["gestion de projets", "planification", "suivi de projets", "gestion de portefeuilles"],
    "Gestion des Relations Clients": ["crm", "gestion des relations clients", "service client"],
    
    # Marketing
    "Marketing Digital": ["marketing digital", "marketing en ligne", "seo", "sem", "publicité en ligne"],
    "Analyse de Marché": ["analyse de marché", "étude de marché", "segmentation de marché"],
    "Stratégie de Marque": ["stratégie de marque", "gestion de marque", "branding"],
    "Publicité et Promotion": ["publicité", "promotion", "campagnes publicitaires", "relations publiques"],
    
    # Design
    "Design Graphique": ["design graphique", "création visuelle", "design de marque"],
    "Design d'Intérieur": ["design d'intérieur", "aménagement intérieur", "décoration"],
    "Design de Produit": ["design de produit", "conception de produit", "design industriel"],
    
    # Santé
    "Médecine": ["médecine", "médecin", "chirurgie", "diagnostic"],
    "Soins Infirmiers": ["soins infirmiers", "infirmière", "soins à domicile"],
    "Pharmacie": ["pharmacie", "pharmacien", "médicaments", "préparation de médicaments"],
    "Santé Publique": ["santé publique", "épidémiologie", "prévention"],
    
    # Éducation
    "Enseignement": ["enseignement", "professeur", "éducation", "pédagogie"],
    "Formation": ["formation", "coach", "formateur", "apprentissage"],
    "Éducation Enfance": ["éducation enfant", "éducateur", "crèche", "école maternelle"],
    
    # Droit
    "Droit": ["droit", "avocat", "juriste", "conseil juridique"],
    "Droit des Affaires": ["droit des affaires", "contrats", "litiges commerciaux"],
    "Droit du Travail": ["droit du travail", "relations employeur-employé", "négociation collective"],
    
    # Sciences
    "Biologie": ["biologie", "biologiste", "recherche en biologie"],
    "Chimie": ["chimie", "chimiste", "analyse chimique"],
    "Physique": ["physique", "physicien", "recherche en physique"],
    
    # Arts
    "Arts Visuels": ["arts visuels", "peinture", "sculpture", "photographie"],
    "Musique": ["musique", "musicien", "composition", "production musicale"],
    "Théâtre": ["théâtre", "acteur", "metteur en scène", "scénariste"],
    
    # Métiers Techniques
    "Ingénierie": ["ingénierie", "ingénieur", "mécanique", "électrique"],
    "Construction": ["construction", "maçonnerie", "charpente", "architecture"],
    "Électricité": ["électricité", "électricien", "installation électrique"],
    
    # Administration
    "Administration Publique": ["administration publique", "gestion publique", "fonctionnaire"],
    "Bureaucratie": ["bureaucratie", "gestion administrative", "secrétariat"],
    "Gestion des Ressources": ["gestion des ressources", "logistique", "approvisionnement"],
}


profil_synonymes = {
    "Technologies de l'Information": [
        "TI", "technologie", "tech", "systèmes d'information", "technologies de l'information",
        "informatique", "IT", "technique informatique", "technologies", "technologie de l'information"
    ],
    "Science des Données": [
        "science des données", "analyste de données", "scientifique des données", "data scientist",
        "ds", "analytique", "data analyst", "expert en données", "analyste en données"
    ],
    "Développement Web": [
        "développeur web", "développeur frontend", "concepteur web", "développement web",
        "web development", "développeur full stack", "programmeur web", "intégrateur web", 
        "développeur back-end", "développeur front-end"
    ],
    "Gestion de Projet": [
        "chef de projet", "pm", "coordinateur de projet", "gestionnaire de projet", "project manager",
        "responsable de projet", "lead de projet", "gestion de projet", "responsable de programme"
    ],
    "Design": [
        "designer", "designer graphique", "designer UX", "designer UI", "design", "graphisme",
        "créateur visuel", "concepteur graphique", "designer produit", "designer d'interface"
    ],
    "Affaires": [
        "analyste d'affaires", "responsable des affaires", "consultant en affaires", "business analyst",
        "consultant en management", "analyste de business", "stratégie d'affaires", "consultant stratégique"
    ],
    "Marketing": [
        "spécialiste en marketing", "responsable marketing", "marketeur digital", "digital marketer",
        "marketing stratégique", "marketing opérationnel", "responsable communication", "expert en marketing",
        "chargé de marketing", "responsable de la promotion"
    ],
    "Ingénierie": [
        "ingénieur", "ingénieur logiciel", "ingénieur matériel", "engineering", "technicien ingénieur",
        "ingénieur système", "ingénieur en informatique", "ingénieur de production", "ingénieur civil",
        "ingénieur électricien", "ingénieur en mécanique"
    ],
    "Finance": [
        "analyste financier", "responsable financier", "comptable", "finance", "gestion financière",
        "contrôleur financier", "analyste de crédit", "spécialiste financier", "auditeur financier",
        "responsable comptable"
    ],
    "Santé": [
        "professionnel de santé", "médecin", "infirmière", "santé", "praticien médical", "soignant",
        "spécialiste en soins", "professionnel médical", "infirmier", "médecin généraliste"
    ],
    "Éducation": [
        "enseignant", "éducateur", "professeur", "pédagogue", "formateur", "éducation", "intervenant",
        "enseignant-chercheur", "responsable pédagogique", "éducateur spécialisé", "coordinateur pédagogique"
    ],
    "Ventes": [
        "représentant commercial", "responsable des ventes", "responsable de compte", "sales manager",
        "responsable de secteur", "commercial", "agent de vente", "responsable client",
        "directeur commercial", "gestionnaire de comptes"
    ],
    "Réseaux": [
        "ingénieur réseau", "administrateur réseau", "technicien réseau", "spécialiste réseaux", 
        "réseaux informatiques", "administration des réseaux", "ingénieur en télécommunications",
        "technicien en réseaux", "spécialiste en réseaux"
    ],
    "Industrie": [
        "technicien industriel", "ingénieur industriel", "responsable de production", "industrie",
        "gestion de la production", "responsable industriel", "ingénieur en production", "superviseur industriel",
        "technicien de maintenance industrielle", "responsable de la chaîne de production"
    ],
    "Aéronautique": [
        "ingénieur aéronautique", "technicien aéronautique", "spécialiste en maintenance aéronautique",
        "aéronautique", "technicien avion", "ingénieur en aéronautique", "maintenance aéronautique",
        "technicien en avionique", "ingénieur en propulsion aéronautique"
    ],
    "Blockchain": [
        "expert blockchain", "développeur blockchain", "consultant blockchain", "technologie blockchain",
        "spécialiste en blockchain", "architecte blockchain", "développeur de contrats intelligents",
        "consultant en blockchain", "expert en crypto-monnaies"
    ],
    "IoT": [
        "ingénieur IoT", "développeur IoT", "spécialiste en objets connectés", "Internet des objets",
        "expert IoT", "développeur en IoT", "technicien IoT", "ingénieur en objets connectés",
        "architecte IoT", "ingénieur en systèmes IoT"
    ],
    "Robotique": [
        "ingénieur en robotique", "technicien en robotique", "spécialiste en automatisation", "robotique",
        "développeur en robotique", "technicien en automatisation", "ingénieur en systèmes robotiques",
        "technicien en robotisation", "expert en robotique industrielle"
    ],
    "Réalité Virtuelle et Augmentée": [
        "développeur VR", "développeur AR", "expert en réalité virtuelle", "expert en réalité augmentée",
        "réalité virtuelle", "réalité augmentée", "concepteur VR", "spécialiste en VR/AR",
        "développeur de réalité virtuelle", "développeur de réalité augmentée"
    ],
    "Data Engineering": [
        "data engineer", "ingénieur de données", "architecte de données", "spécialiste en ingénierie des données",
        "data engineering", "ingénieur en big data", "développeur de données", "ingénieur de pipeline de données"
    ],
    "Big Data": [
        "big data", "analyste big data", "spécialiste en big data", "architecte big data",
        "ingénieur big data", "consultant big data", "analyste de données massives", "expert en big data"
    ],
    "Génie Mécanique": [
        "ingénieur en génie mécanique", "technicien en génie mécanique", "spécialiste en génie mécanique",
        "génie mécanique", "ingénieur mécanique", "technicien en mécanique", "ingénieur en conception mécanique"
    ],
    "Systèmes Automatisés": [
        "ingénieur en systèmes automatisés", "spécialiste en systèmes automatisés", "technicien en automatisation",
        "automatisation", "ingénieur en automatisation", "spécialiste en contrôle automatisé", "ingénieur en contrôle de processus"
    ],
    "Gestion des Risques": [
        "gestion des risques", "analyste de risques", "consultant en gestion des risques", "responsable de la gestion des risques",
        "spécialiste en risques", "expert en gestion des risques", "gestionnaire de risques"
    ],
    "Supply Chain": [
        "responsable de la chaîne d'approvisionnement", "gestionnaire de supply chain", "spécialiste supply chain",
        "logistique", "responsable logistique", "analyste supply chain", "coordinateur supply chain",
        "gestion des approvisionnements"
    ],
    "Télécommunications": [
        "ingénieur télécommunications", "technicien télécommunications", "spécialiste en télécommunications",
        "réseaux de télécommunications", "responsable télécommunications", "ingénieur en réseaux télécoms",
        "technicien en télécommunications", "consultant en télécommunications"
    ],
    "Intelligence Artificielle": [
        "IA", "intelligence artificielle", "spécialiste en IA", "data scientist", "apprentissage automatique",
        "machine learning", "chercheur en IA", "ingénieur en IA", "expert en intelligence artificielle"
    ],
    "Sécurité Informatique": [
        "sécurité informatique", "analyste en cybersécurité", "responsable sécurité informatique", "spécialiste en sécurité",
        "consultant en cybersécurité", "expert en sécurité informatique", "ingénieur en sécurité"
    ],
    "Environnement": [
        "responsable environnement", "spécialiste en environnement", "consultant environnemental", "gestion de l'environnement",
        "analyste environnemental", "responsable de la durabilité", "expert en développement durable"
    ],
    "Architecture": [
        "architecte", "architecte d'intérieur", "designer architectural", "urbaniste", "planificateur urbain",
        "architecte de paysage", "architecte en bâtiment", "architecte en urbanisme"
    ],
    "Gestion de la Qualité": [
        "responsable qualité", "analyste qualité", "spécialiste en gestion de la qualité", "gestion de la qualité",
        "auditeur qualité", "consultant en qualité", "ingénieur qualité", "responsable assurance qualité"
    ],
    "Administration des Systèmes": [
        "administrateur systèmes", "administrateur de systèmes", "responsable des systèmes", "gestion des systèmes",
        "administrateur de serveurs", "administration des réseaux", "technicien systèmes"
    ]
}


class User:
    def __init__(self, mongo: PyMongo):
        self.collection: Collection = mongo.db.login

    def create_user(self, email: str, password: str, role: str) -> None:
        hashed_password = generate_password_hash(password)
        user = {
            'email': email,
            'password': hashed_password,
            'role': role
        }
        self.collection.insert_one(user)

    def find_user_by_email(self, email: str) -> Optional[dict]:
        return self.collection.find_one({'email': email})

    def verify_password(self, password: str, hashed_password: str) -> bool:
        return check_password_hash(hashed_password, password)


class Resume:
    def __init__(self, mongo: PyMongo):
        self.collection: Collection = mongo.db.cvs

    def create_resume(self, first_name: str, last_name: str, profil: str , resume_file : str , mot_cles : list ) -> None:
        cv = {
            'first_name': first_name,
            'last_name': last_name ,
            'email' : "",
            'phone' : "",
            'profil': profil ,
            'resume_path' : resume_file ,
            'resume_convertit' : "",
            'mot_cles' : mot_cles
        }
        self.collection.insert_one(cv)


    def select_resume(self, profile: str, key_skills: list) -> None:
        competence_trouvee = []
        for skill in key_skills:
            term = skill.lower()
            for competence, synonymes in competences_synonymes.items():
                if term in [syn.lower() for syn in synonymes]:
                    competence_trouvee.append(competence)
        else :
            pass
        
        for skill in competence_trouvee:
            if skill in profil_synonymes:
                key_skills.extend(profil_synonymes[skill])
        else :
            pass

        profil_trouvee = []
        term = profile.lower()
        for pro, synonymes in profil_synonymes.items():
            if term in [syn.lower() for syn in synonymes]:
                profil_trouvee.append(pro)
      
        
        extended_profiles = [profile]
        for pro in profil_trouvee:
            if pro in profil_synonymes:
                extended_profiles.extend(profil_synonymes[pro])
        else :
            pass
        
        
        pipeline = [
            # Stage 1: Convert profile to lowercase and match profiles
            {
                "$addFields": {
                    "profil_lower": {
                        "$toLower": "$profil"
                    }
                }
            },
            {
                "$match": {
                    "$or": [
                        {
                            "profil_lower": {
                                "$regex": f".*{re.escape(profile.lower())}.*",
                                "$options": "i"
                            }
                        }
                        for profile in extended_profiles
                    ]
                }
            },
            # Stage 2: Filter skills after finding profiles
            {
                "$addFields": {
                    "matchedSkills": {
                        "$filter": {
                            "input": "$mot_cles",
                            "as": "skill",
                            "cond": {
                                "$or": [
                                    {
                                        "$in": [
                                            {
                                                "$toLower": "$$skill"
                                            },
                                            [skill.lower() for skill in key_skills]
                                        ]
                                    },
                                    {
                                        "$regexMatch": {
                                            "input": "$$skill",
                                            "regex": f".*{'|'.join([re.escape(skill) for skill in key_skills])}.*",
                                            "options": "i"
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            },
            # Filter out documents where 'matchedSkills' is empty
            {
                "$match": {
                    "matchedSkills": {
                        "$ne": []
                    }
                }
            },
            # Project the fields to show in the results for testing
            {
                "$project": {
                    "first_name": 1,
                    "last_name": 1,
                    "profil": 1,
                    "profil_lower": 1,  # Include for debugging
                    "mot_cles": 1,      # Include matched skills for debugging
                    "resume_path": 1,
                    "resume_convertit": 1
                }
            }
        ]

        # Execute the MongoDB aggregation pipeline and return the results
        results = dumps(self.collection.aggregate(pipeline))
        return results 