---
title: "Créer des briefs personnalisés avec l’IA : retour d’expérience pédagogique"
description: "Comment une Agent Skill a permis de générer des briefs réalistes et personnalisés pour un module de video explainer en Bachelor Graphiste Motion Designer."
publishDate: 2026-05-19
tags:
  - IA
  - pédagogie
  - motion design
  - agent skills
featured: true
---

En décembre 2025, j’ai commencé à intervenir chez CIFACOM auprès des étudiants de Bachelor Graphiste Motion Designer, sur un module consacré au video explainer.

Le projet était assez classique dans sa forme : concevoir puis produire une courte vidéo explicative en motion design 2D, entre 60 et 90 secondes, avec voice-over, musique et sound design. Mais j’avais envie d’éviter un écueil que l’on rencontre souvent dans les exercices pédagogiques : le brief trop générique.

Un sujet unique pour toute une classe a l’avantage d’être simple à encadrer et à évaluer. Mais il produit souvent des réponses très homogènes. Trois ou quatre sujets au choix améliorent déjà les choses, mais cela reste limité. Sur quelques propositions, il y a peu de chances que chaque étudiant trouve un sujet qui l’intéresse réellement.

C’est dans ce contexte que j’ai commencé à utiliser les Skills, lancées par Anthropic quelques semaines plus tôt.

## Une skill, ce n’est pas juste un prompt

Dans l’écosystème Claude, une skill est une manière de donner à un assistant IA une compétence spécialisée.

Ce n’est pas simplement un prompt que l’on copie-colle pour obtenir un résultat ponctuel. C’est plutôt un petit système de travail réutilisable : un cadre, des règles, des étapes, des exemples, parfois des documents de référence.

L’intérêt est de transformer un assistant généraliste en outil plus précis pour une tâche donnée.

Dans mon cas, la tâche était la suivante : générer des briefs de video explainer personnalisés, réalistes, pédagogiquement cohérents, et suffisamment variés pour que chaque étudiant puisse travailler sur un sujet qui l’engage vraiment.

La skill complète est consultable ici :

[Lire la skill brief-generator-videoexplainer](/resources/brief-generator-videoexplainer)

## Le cadre pédagogique du module

Le module s’inscrivait dans le Bachelor Graphiste Motion Designer, niveau 6 RNCP. Il était organisé en deux blocs principaux.

Le premier bloc portait sur la conception : analyse du brief, développement du concept narratif, définition de l’univers visuel, création du storyboard, réalisation des style frames et de l’animatique, puis présentation du concept.

Le deuxième bloc portait sur la production : création des assets 2D, animation dans After Effects, organisation des fichiers, optimisation du rendu, documentation du processus et préparation du dossier jury.

Le livrable final était une vidéo explicative courte, en motion design 2D, avec un rendu complet image et son.

Cette structure imposait plusieurs contraintes fortes :

- une durée précise, entre 60 et 90 secondes
- une production en 2D uniquement
- un voice-over ou une voix témoin
- une musique et un sound design
- une documentation claire du processus
- une organisation professionnelle des fichiers
- une capacité à justifier les choix narratifs, visuels et techniques

Le brief personnalisé devait donc rester compatible avec ces contraintes. Il ne s’agissait pas de laisser l’IA inventer librement un sujet séduisant, mais de décliner un cadre pédagogique déjà défini.

## Le problème des briefs trop génériques

Dans un cours de motion design, le choix du brief a un impact direct sur l’engagement.

Si le sujet est trop abstrait, trop scolaire ou trop éloigné des intérêts des étudiants, ils peuvent exécuter correctement l’exercice sans vraiment s’y investir. Ils répondent à une consigne, mais ne s’approprient pas le projet.

À l’inverse, quand un étudiant travaille sur un sujet qui lui parle, la dynamique change. Il cherche davantage de références, défend mieux ses choix, accepte plus volontiers les contraintes et comprend plus concrètement les arbitrages de production.

L’enjeu était donc de construire un système qui permette à la fois :

- une personnalisation réelle des sujets
- une équité dans l’évaluation
- un niveau de difficulté comparable
- un réalisme professionnel
- un lien direct avec les compétences RNCP visées

C’est exactement le genre de problème où une skill peut devenir utile.

## Comment fonctionnait la skill

La skill posait quatre questions à l’étudiant.

1. Quelle thématique as-tu choisie ?
2. Quel sujet spécifique souhaites-tu traiter ?
3. Quel type de commanditaire as-tu choisi ?
4. Quelle est l’identité précise de ce commanditaire ?

Les thématiques proposées étaient volontairement larges : personnage historique, produit innovant, histoire d’une invention, œuvre d’art, pop star.

Les types de commanditaires étaient, eux, inspirés de contextes professionnels crédibles : ARTE, musée, influenceur Instagram, youtubeur, entreprise ou startup.

À partir de cette combinaison, la skill générait un brief adapté.

Par exemple :

- Alan Turing pour un programme court ARTE
- Les Nymphéas de Monet pour un film de médiation dans un musée
- L’encre électronique pour un segment YouTube
- Un produit cleantech pour une startup en levée de fonds
- David Bowie pour un format Instagram

Le système était simple à utiliser, mais assez riche pour produire des briefs très différents.

## Un brief ARTE ne parle pas comme un DM Instagram

Un point important de la skill était la simulation du type de commanditaire.

Un brief ARTE devait ressembler à un cahier des charges institutionnel : contexte de diffusion, ligne éditoriale, contraintes techniques, livrables, contacts, processus de validation.

Un musée devait formuler une demande autour de la médiation culturelle : exposition, parcours visiteur, objectif pédagogique, contexte d’installation, public varié.

Un influenceur Instagram pouvait envoyer un message beaucoup plus informel, parfois flou, avec des références de “vibe”, une contrainte de durée, une attente de rendu complet et peu de détails sur le budget ou la validation.

Un youtubeur avait plutôt un brief structuré mais pragmatique : segment à intégrer dans une vidéo plus longue, cohérence avec la chaîne, contraintes de placement, éventuelle relation avec un sponsor.

Une startup formulait la demande à travers des objectifs business : pitch, vente, levée de fonds, salon professionnel, proposition de valeur, métriques, deadline.

Ce travail sur la forme du brief était important. Il permettait aux étudiants de comprendre que toutes les demandes professionnelles ne se ressemblent pas. Le fond du projet change, mais la manière dont le client exprime son besoin change aussi.

## Des briefs volontairement incomplets

La skill ne devait pas générer des briefs parfaits.

Au contraire, elle devait produire des briefs réalistes, donc parfois incomplets.

C’était un choix pédagogique central.

Dans la vraie vie, un client ne donne pas toujours un angle narratif clair. Il ne précise pas forcément le niveau de vulgarisation attendu. Il oublie parfois de parler du processus de validation, du budget, des contraintes d’accessibilité, du nombre d’allers-retours ou des références visuelles.

Ces zones d’ombre étaient intégrées volontairement dans les briefs.

L’objectif était de travailler la compétence C1.1 du bloc conception : analyser le contexte de la demande d’un client ou commanditaire.

Les étudiants devaient donc apprendre à distinguer :

- ce qui est explicitement demandé
- ce qui est implicite
- ce qui manque
- ce qui doit être demandé au client
- ce qui peut être formulé comme hypothèse de travail

C’est une compétence très concrète. Elle prépare mieux au métier qu’un brief parfaitement verrouillé, où toute l’intelligence du cadrage a déjà été faite à la place de l’étudiant.

## Personnaliser sans casser l’évaluation

La difficulté avec la personnalisation, c’est l’équité.

Si chaque étudiant a un sujet différent, comment garder une évaluation cohérente ?

La réponse était de ne pas personnaliser les compétences évaluées, mais seulement le contexte d’application.

Tous les étudiants travaillaient sur les mêmes objectifs : analyser un brief, développer un concept narratif, définir un univers visuel, produire un storyboard, réaliser des style frames, créer une animatique, puis fabriquer une vidéo finale avec une organisation professionnelle.

La grille d’évaluation restait commune.

Ce qui changeait, c’était le monde dans lequel ces compétences s’exerçaient.

Un étudiant travaillait peut-être pour un musée, un autre pour une chaîne YouTube, un autre pour une startup. Mais tous devaient démontrer leur capacité à transformer une demande en projet de motion design cohérent.

C’est, à mon sens, l’un des usages les plus intéressants de l’IA en pédagogie : permettre plus de variété sans perdre le cadre.

## Deux fronts de travail : narration et direction artistique

Le module s’appuyait aussi sur une organisation en deux fronts parallèles.

D’un côté, le front narration : texte, structure, voice-over, timing, clarté du message.

De l’autre, le front direction artistique : moodboard, références, style frames, composition, palette, typographie, univers visuel.

Cette organisation était particulièrement utile pour un format court. Sur une vidéo de 60 à 90 secondes, le texte ne peut pas être traité comme une formalité. Il faut le lire, l’enregistrer, mesurer la durée, couper, reformuler, tester le rythme.

En parallèle, la direction artistique doit avancer assez tôt pour éviter de se retrouver avec un bon texte mais aucun langage visuel solide.

Les briefs personnalisés nourrissaient ces deux fronts. Le type de commanditaire influençait le ton narratif, mais aussi les références visuelles, le format de diffusion, la densité d’information, le niveau de pédagogie et le style de présentation.

## Ce que l’IA a réellement apporté

L’IA n’a pas remplacé le travail pédagogique.

Elle a surtout permis de le démultiplier.

Sans skill, produire manuellement autant de briefs différenciés aurait été possible, mais très coûteux en temps. Il aurait fallu écrire chaque demande, varier les tons, adapter les contraintes, penser les zones d’ombre, maintenir la cohérence avec le calendrier et avec les compétences évaluées.

La skill a permis de systématiser cette logique.

Elle ne décidait pas du cadre pédagogique. Elle l’appliquait.

Elle ne remplaçait pas le regard de l’enseignant. Elle produisait une première matière de travail, que je pouvais relire, ajuster et intégrer au cours.

La nuance est importante. Un mauvais cadre donne de mauvais briefs plus vite. Un bon cadre permet à l’IA de produire des variations utiles.

## Les effets observés côté étudiants

Le résultat a été très encourageant.

Les étudiants se sont fortement approprié leurs sujets. Les projets étaient plus variés, les références plus personnelles, les discussions plus concrètes.

On ne parlait pas seulement de “faire une vidéo”. On parlait de public cible, de contexte de diffusion, de client, de niveau de vulgarisation, de contraintes techniques, de direction artistique, de planning, de dossiers de production.

Le passage au bloc fabrication a aussi montré l’intérêt de cette phase de conception. Les étudiants ne partaient pas d’un exercice abstrait. Ils transformaient un concept choisi, cadré et défendu en assets, animations, transitions et rendus.

Il faudra attendre le jury final pour valider pleinement l’impact sur les résultats, mais plusieurs films m’ont déjà vraiment surpris par leur niveau de finition et d’investissement.

## Ce que je referais, et ce que j’améliorerais

Je referais clairement ce système.

Je renforcerais probablement encore trois points.

D’abord, la phase de questionnement du brief. Les zones d’ombre étaient présentes, mais on peut aller plus loin en demandant explicitement aux étudiants de formuler une liste de questions au commanditaire avant de commencer la conception.

Ensuite, la traçabilité des décisions. Quand un étudiant complète une information manquante par une hypothèse, il devrait la documenter comme telle : “Le brief ne précise pas ce point, je fais donc l’hypothèse suivante.”

Enfin, la comparaison entre brief initial et projet final. C’est un excellent exercice pour comprendre les écarts entre demande, intention, production et résultat.

## Pourquoi cet usage me semble important

On parle souvent de l’IA dans l’enseignement sous l’angle de la triche, de l’automatisation ou de la production de contenus.

Ces sujets sont réels, mais ils ne couvrent qu’une partie de la question.

Dans cette expérience, l’IA n’a pas été utilisée pour faire le travail à la place des étudiants. Elle a servi à créer de meilleures situations de travail pour eux.

Des situations plus personnalisées, plus réalistes, plus exigeantes.

Et c’est ce point qui m’intéresse.

L’IA devient utile en pédagogie quand elle aide à mieux concevoir l’environnement d’apprentissage. Pas quand elle simplifie artificiellement la tâche, mais quand elle permet d’accrocher les étudiants à une complexité plus proche du réel.

Pour moi, c’est l’un des usages les plus prometteurs des agents et des skills : construire des dispositifs pédagogiques plus fins, plus adaptables, sans renoncer au cadre ni à l’exigence.

## Lire la skill

Pour les curieux, j’ai mis en ligne la skill utilisée pour générer ces briefs.

Elle n’est pas présentée comme un modèle parfait ni comme une solution universelle. C’est un document de travail, conçu pour un module précis, avec ses contraintes, ses objectifs et ses limites.

Mais c’est justement ce qui la rend intéressante : elle montre concrètement comment un usage de l’IA peut être ancré dans une situation pédagogique réelle.

[Consulter la skill brief-generator-videoexplainer](/resources/brief-generator-videoexplainer)
