import google.generativeai as genai # type: ignore
import json

class Generate():
    def __init__(self, df=None):
        self.df = df 
        self.model = self.set_model()

    def set_model(self):
        # Configurez l'API avec votre clé
        GOOGLE_API_KEY = "AIzaSyCOzlimldyMG6JlYkCgLDx9PcrWkQLgEAk"
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-1.5-flash')
        return model

    def generate_text(self):
        print('Start Generate Process')

        json_response = []
        for index, row in self.df.iterrows():
            resume = row['text']
            prompt = f"""
            1. Nettoyage du CV** :
            - Supprimez tous les caractères spéciaux et les espaces inutiles pour garantir une présentation professionnelle.
            - Uniformisez les dates au format "dd/mm/yyyy" ou "mm/yyyy" selon ce qui est le plus approprié. Assurez-vous que les dates sont cohérentes tout au long du CV.
            - Corrigez toutes les fautes d'orthographe et de grammaire pour rendre le texte impeccable (ne pas afficher le texte nettoyé).
            - Organisez les informations car parfois elles ont mal organisées(ne pas afficher le texte nettoyé).

            2. Génération de la réponse au format JSON** :
            - Après avoir nettoyé le CV, créez un objet JSON en suivant strictement la structure indiquée ci-dessous.
            - Incluez toutes les informations pertinentes, reformulez si nécessaire pour rendre le contenu plus clair et attrayant pour un recruteur.
            - Assurez-vous que chaque champ est rempli avec des informations correctes et complètes. Si une information est manquante, laissez le champ vide avec des guillemets.

            Structure JSON attendue :

            {{
                "nom_prenom": "Nom complet de la personne",
                "profil": "Titre du profil professionnel ou éducatif",
                "work_summary": "réaliser un résumé professionnel à partir du CV fourni en suivant le modèle suivant, qui contient les composants suivants : Titre professionnel, Domaines d'expertise, Compétences clés, Caractéristique principale, et Expérience.",
                "education": [
                {{
                    "annee": "Date de début - Date de fin (yyyy-yyyy)", 
                    "diplome": "Intitulé du diplôme",   
                    "etablissement": "Nom de l'établissement"
                }}
                ],
                "experience": [
                {{
                    "entreprise": "Nom de l'entreprise", 
                    "poste": "Titre du poste", 
                    "position": "Indiquer s'il s'agit d'un stage (PFE ou PFA) ou d'un emploi",
                    "start_date": "Date de début (format dd/mm/yyyy ou mm/yyyy)", 
                    "end_date": "Date de fin (format dd/mm/yyyy ou mm/yyyy)",
                    "taches": ["Liste des tâches effectuées dans ce poste"],
                    "competences_utilisees": ["Liste des compétences utilisées dans ce poste"]
                }}
                ],
                "competences": ["Liste des compétences techniques"],
                "projets": [
                {{
                    "titre_projet": "Nom du projet", 
                    "taches": ["Liste des tâches réalisées ou bien une description du projet"], 
                    "technologies": ["Technologies utilisées pour ce projet"], 
                    "date": "Date de réalisation du projet"
                }}
                ],
                "langues": ["Liste des langues maîtrisées"],
                "certifications": [
                {{
                    "nom": "Nom de la certification",
                    "date": "Date d'obtention (format dd/mm/yyyy ou mm/yyyy)",
                    "score": "Score obtenu (si applicable)",
                    "organisme": "Organisme de délivrance de la certification"
                }}
                ],
                "annees_d_experience": "Nombre total d'années d'expérience professionnelle (en années)",
                "mot_cles" : ["Veuillez extraire les mots-clés d'un CV afin de faciliter la recherche par les recruteurs. Concentrez-vous sur les compétences techniques, les technologies ou outils mentionnés, ainsi que les certifications importantes. Par exemple, identifiez des termes comme 'développeur', 'DevOps', 'Python', 'Docker', et 'AWS Certified'."]

            }}

            CV à nettoyer :
            {resume}
            """
            response = self.model.generate_content(prompt)
            json_response.append({
                'path_of_image': row['path_of_image'],
                'res': response.text
            })

        print('End Generate Process')

        return json_response
