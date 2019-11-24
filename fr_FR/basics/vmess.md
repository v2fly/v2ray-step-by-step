# VMess

Le protocole VMess a été créé et utilisé dans V2ray. Il est similaire à Shadowsocks, conçu pour masquer le trafic Internet et empêcher la fraude [inspection approfondie des paquets] (https://en.wikipedia.org/wiki/Deep_packet_inspection) de GFW. VMess est le principal protocole utilisé pour communiquer entre le serveur et le client.

Dans cette section, nous avons fourni un exemple de configuration VMess, qui est un ensemble de fichiers de configuration de base pour le serveur et le client. Ce type de configuration est la configuration la plus simple que V2Ray puisse vous aider à passer de la censure sur Internet.

Le fichier de configuration JSON de V2Ray utilise des structures entrantes (entrantes) et sortantes (sortantes). Cette structure reflète la direction du flux de trafic du paquet et confère à V2Ray un pouvoir et une fonctionnalité puissants, sans confusion et sans confusion. Pour parler franchement, nous pouvons considérer V2Ray comme une boîte avec des entrées et des sorties (c'est-à-dire entrante et sortante). Nous mettons le paquet dans la boîte par une porte, puis la boîte a quelques mécanismes (ce mécanisme s'appelle le routage, qui sera discuté en détail dans un autre chapitre) pour décider à partir de quelle sortie le paquet sera envoyé. De cette façon, si V2Ray est le client, entrant reçoit les données du navigateur et est envoyé sortant (généralement envoyé au serveur V2Ray). V2Ray agit en tant que serveur et entrant reçoit les données du client V2Ray, qui sont envoyées par sortant (généralement un site cible tel que Google que vous souhaitez visiter).


-------

## Préparation avant la configuration

En fait, vous n'avez rien à préparer tant que vous avez un éditeur de texte pour modifier la configuration. Cependant, il existe toujours un rappel amical, car de nombreux débutants ont écrit une syntaxe ou un format incorrect dans leurs configurations JSON. Cela est courant car les débutants ne sont pas familiarisés avec ces outils de ligne de commande et peuvent utiliser le Bloc-notes Windows comme éditeur JSON principal. Nous ne recommandons pas le Bloc-notes Windows en raison de sa faible prise en charge des options d'encodage et de fin de ligne.

VSCode est plutôt un outil utile pour l'écriture de JSON et il prend également en charge le reformatage, puissant pour les débutants. En outre, il existe de nombreux autres éditeurs de texte, tels que Sublime Text, Atom, Notepad ++, etc. Ils sont tous polyvalents et faciles à utiliser. Vous pouvez les rechercher sur Google pour plus de détails. Ces logiciels ont des fonctionnalités telles que la coloration, le pliage, le reformatage du code, ils sont donc fortement recommandés. Si vous ne souhaitez installer aucun logiciel, vous pouvez trouver certains éditeurs JSON en ligne et la syntaxe sera vérifiée automatiquement.

L'image ci-dessous est une comparaison entre le Bloc-notes et Sublime Text, à titre de référence pour choisir la meilleure.
! [] (../ resource / images / notepad_vs_ST.png)

Le format de fichier JSON est un autre exemple:
! [] (../ resource / images / formatdemo.gif)

Il existe un outil de ligne de commande appelé `jq`. En exécutant la commande suivante, vous pouvez vérifier la grammaire du fichier de configuration.

`` `
$ jq. config.json
`` `
Ici `config.json` est le fichier` config.json` dans le répertoire actuel. Portez une attention particulière à la période dans la commande. Vous ne pouvez pas l'ignorer.

! [] (../ resource / images / jqdemo.png)
Lorsque je supprime la virgule après "23ad6b10-8d1a-40f7-8ad0-e3e35cd38297":

! [] (../ resource / images / jqerror.png)

Notez qu'une fonctionnalité de commentaire a été ajoutée depuis V2Ray v2.11. Le fichier de configuration autorise les commentaires `//` et `/ ** /` qui ne sont pas pris en charge par le format JSON officiel. Par conséquent, il est censé être signalé comme une erreur dans certains outils de vérification des erreurs. Ne paniquez pas.

Cependant, il est recommandé d'utiliser la fonctionnalité de vérification de la configuration fournie par V2Ray (option `-test`) car vous pouvez vérifier le contenu autre que les erreurs de syntaxe JSON, tel que typo` vmess` en tant que `vmes`.
`` `
$ / usr / bin / v2ray / v2ray -test -config /etc/v2ray/config.json
échec de l'analyse de json config: Ext | Tools | Conf | Série: échec de l'analyse de json config> Ext | Tools | Conf: échec du chargement de la configuration de détour entrante. > Ext | Tools | Conf: identifiant de configuration inconnu: vmss
Main: impossible de lire le fichier de configuration: /etc/v2ray/config.json> Main | Json: impossible d'exécuter v2ctl pour convertir le fichier de configuration. > état de sortie 255
`` `

Si le fichier de configuration est ok, le message retourné sera comme ceci:

`` `
$ / usr / bin / v2ray / v2ray -test -config /etc/v2ray/config.json
V2Ray v3.15 (die Commanderin) 20180329
Une plate-forme unifiée contre la censure.
Configuration OK
`` `

## Exemple de configuration

Nous donnons les exemples de fichiers de configuration ci-dessous, y compris côté serveur et côté client. Vous devez remplacer votre configuration par celle ci-dessous et remplacer l’adresse IP / le serveur par le vôtre; alors vous pouvez profiter d'internet non censuré. Notez que * la configuration ne sera pas appliquée tant que vous ne redémarrez pas le V2Ray *.

::: avis de danger
L'autorisation du protocole VMess est basée sur le temps. Vous devez vous assurer que le temps système entre le serveur et le client est inférieur à 90 secondes.
:::

### Configuration côté client

Voici la configuration côté client, éditez le fichier config.json du client sur le contenu suivant et redémarrez V2Ray une fois la modification terminée pour appliquer la configuration modifiée.
`` `json
{
  "inbounds": [
    {
      "port": 1080, // port d'écoute
      "protocole": "chaussettes", // le protocole entrant est SOCKS 5
      "renifler": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "paramètres": {
        "auth": "noauth" // Paramétrage de l'autorisation du protocole chaussettes. Ici, noauth signifie pas d’autorisation, c’est pourquoi nous n’avons pas besoin d’autoriser.
      }
    }
  ],
  "outbounds": [
    {
      "protocole": "vmess", // protocole sortant
      "paramètres": {
        "vnext": [
          {
            "address": "serveraddr.com", // adresse du serveur, vous devez l'éditer sur votre propre adresse IP / domian.
            "port": 16823, // port d’écoute du serveur.
            "utilisateurs": [
              {
                "id": "b831381d-6324-4d53-ad4f-8cda48b30811", // UUID, doit être identique au côté serveur
                "alterId": 64 // AlterID doit être identique au côté serveur
              }
            ]
          }
        ]
      }
    }
  ]
}
`` `

Dans la configuration, un identifiant est utilisé pour l'autorisation (dans ce cas, b831381d-6324-4d53-ad4f-8cda48b30811), qui agit comme le mot de passe de Shadowsocks. L'identifiant de l'utilisateur VMess doit être au même format que l'UUID. Il n'est pas nécessaire d'en savoir beaucoup sur id ou UUID. Il suffit de connaître les points suivants ici:
* L'UUID entrant et le UUID sortant du protocole VMess correspondant doivent être identiques (si vous ne comprenez pas bien cette phrase, vous pouvez simplement comprendre que l'UUID du serveur et du client doit être identique).
* Puisque l'id utilise le format UUID, nous pouvons utiliser n'importe quel outil de génération d'UUID pour générer l'UUID en tant qu'id ici. Par exemple, [Générateur d'UUID] (https://www.uuidgenerator.net/). Sur ce site Web, vous pouvez obtenir un UUID dès que vous ouvrez ou actualisez cette page, comme indiqué ci-dessous. Alternativement, il peut être généré sous Linux en utilisant la commande `cat / proc / sys / kernel / random / uuid`.

! [] (../ resource / images / generate_uuid.png)

### Configuration côté serveur

Vous trouverez ci-dessous la configuration du serveur. Modification du fichier config.json dans le répertoire `/ etc / v2ray` du serveur vers le fichier JSON suivant. Une fois la modification terminée, redémarrez V2Ray pour appliquer la configuration modifiée.
`` `json
{
  "inbounds": [
    {
      "port": 16823, // port d'écoute du serveur
      "protocole": "vmess", // protocole entrant majeur
      "paramètres": {
        "clients": [
          {
            "id": "b831381d-6324-4d53-ad4f-8cda48b30811", // UUID, doit être conservé de la même manière entre serveur et client.
            "alterId": 64
          }
        ]
      }
    }
  ],
  "outbounds": [
    {
      "protocole": "liberté", // protocole sortant de Majoy.
      "paramètres": {}
    }
  ]
}
`` `

## Ce qui se produit?

Voici une introduction simple sur le fonctionnement de V2Ray.

Que le processus de V2Ray se comporte comme un client ou un serveur, le fichier de configuration est constitué de deux parties: `inbounds` et` outbounds`. V2Ray n'utilise pas l'architecture C / S (client / serveur) du logiciel proxy standard, il peut être utilisé en tant que serveur et / ou client. En d'autres termes, chaque V2Ray est un nœud, `inbound` est une configuration sur la façon de se connecter au nœud précédent et` outbound` est une configuration sur la manière de se connecter au nœud suivant. Pour le premier noeud, `inbound` est connecté au navigateur; pour le dernier nœud, `outbound` est connecté au site Web cible. `inbounds` et` outbounds` sont des collections de `inbound` et` outbound`, ce qui signifie que chaque nœud V2Ray peut avoir plusieurs entrées et sorties. Il n'y a qu'une entrée et une sortie dans cet exemple pour faciliter l'explication et la compréhension.

### Côté client

Dans l'exemple de configuration du client, le port d'écoute est 1080, c'est-à-dire que V2Ray écoute sur un port 1080 et le protocole est socks. En supposant que nous ayons configuré le proxy du navigateur (hôte SOCKS: 127.0.0.1, port: 1080), si vous visitez google.com, le navigateur enverra un paquet au protocole chaussettes à envoyer à la machine au port 1080 de le périphérique local (127.0.0.1 est votre périphérique local, ou dites localhost). A ce moment, le paquet sera reçu par V2Ray.

Ensuite, examinons les limites, le protocole est VMess, ce qui indique que V2Ray chiffrera le paquet par le protocole [VMess] (https://www.v2ray.com/developer/protocols/vmess.html). Le paquet sera chiffré par l'UUID (dans cet exemple, l'UUID est b831381d-6324-4d53-ad4f-8cda48b30811), puis envoyé à l'adresse du serveur distant `serveraddr.com` avec le port` 16823`, où l'adresse du serveur et le port sont. L'adresse du serveur peut être un nom de domaine ou une adresse IP, à condition qu'elle soit connectable.


Dans les inbounds configurés par le client, il y a un champ `" sniffing "`. Le manuel V2Ray est interprété en tant que "détection de trafic, réinitialisant la cible demandée en fonction du type de trafic spécifié". Ce n'est pas très facile à comprendre. Dis cette chose. Il consiste à identifier le nom de domaine à partir du trafic réseau. Ce reniflement a deux utilisations:

1. Éviter les intoxications par le DNS;
2. Pour le trafic IP, les règles de routage (mentionnées dans le chapitre suivant) peuvent être appliquées;
3. Identifiez le protocole BT et interceptez ou connectez-vous directement au trafic BT en fonction de vos besoins (une section est spécifiquement mentionnée plus tard).

Si vous utilisez le navigateur Tor, n'activez pas le sniffing (définissez l'option enable de la section sniffing sur false), sinon Tor ne pourra pas accéder à Internet.

### Du côté serveur

Regardez ensuite le serveur, l’UUID de configuration du serveur est b831381d-6324-4d53-ad4f-8cda48b30811, le serveur V2Ray essaiera de le déchiffrer avec cette clé. Lors de la réception du paquet envoyé par le client, si le déchiffrement est réussi, vérifiez avec les horodatages. Si les horodatages sont corrects entre serveur et client, le paquet sera envoyé à sortant; Ici, le protocole sortant est libre (signifie ici une connexion directe), le paquet de données sera envoyé directement à un site Web tel que google.com.

Le flux de paquets indiqué par:
```
{browser} <--(socks)--> {V2Ray client inbound  <->  V2Ray client outbound} <--(VMess)--> {V2Ray server inbound  <->  V2Ray server outbound} <--(Freedom)--> {Target site}
```

Il existe également un paramètre `alterId` dans la configuration. Ce paramètre est principalement utilisé pour améliorer la capacité anti-détection. En théorie, plus le paramètre `alterId` est grand, mieux c'est, mais plus la mémoire est grande (uniquement pour le serveur, le client n'occupe pas la mémoire), il est donc préférable de définir une valeur intermédiaire sous le compromis. Alors, quelle est la taille du meilleur? En fait, il s’agit d’un sous-scénario. Nous n’avons pas testé cela à la lettre, mais en fonction de l’expérience, il convient de définir la valeur de `alterId` entre 30 et 100. La taille de `alterId` permet de s’assurer que le client est inférieur ou égal au serveur. .

Certaines personnes se sont demandé comment les données étaient revenues après l'envoi de la demande. Après tout, la plupart des scènes ont été téléchargées. Ce n'est en fait pas un problème. Étant donné que la demande est envoyée via V2Ray, les données de réponse seront également renvoyées via V2Ray. (Si vous connaissez bien les réseaux IP, vous direz probablement qu'il n'est pas absolu que le trafic soit renvoyé avec le même itinéraire. Cependant, nous n'avons pas besoin de nous concentrer sur la couche réseau, mais en tant que perspective de la couche application, être considéré comme le même itinéraire.)

--------

## Remarques

- Afin de donner une brève introduction au fonctionnement de V2Ray, il existe des endroits où la description du principe dans cette section peut ne pas être correcte. Cependant, il vous suffit de comprendre ce principe. La conception du protocole VMess est décrite dans le [Protocole VMess] (https://www.v2ray.com/developer/protocols/vmess.html) dans le manuel du développeur ou vous pouvez également vérifier les codes d'origine sur github.
- L'identifiant est au format UUID. S'il vous plaît utiliser un logiciel pour générer. N'essayez pas d'en créer un vous-même, sinon cela créera un mauvais format.
- Le protocole VMess peut définir la suite de chiffrement de chiffrement, mais les différentes méthodes de chiffrement de VMess n'ont aucune différence évidente pour le mur. Cette section ne donne pas la méthode de configuration appropriée (car cela n’est pas important, VMess choisira une méthode de cryptage appropriée par défaut). La configuration spécifique peut être trouvée dans le [Manuel V2Ray] (https://v2ray.com/chapter_02/protocols/vmess.html). Pour connaître les performances des différentes méthodes de cryptage, reportez-vous à [Test de performance] (/ app / benchmark.md).

-------

## Guide de dépannage

En suivant les instructions ci-dessus, V2Ray doit être déployé avec succès. Cependant, certains lecteurs risquent toujours de manquer des points essentiels, ce qui entraînerait une configuration incorrecte une fois la configuration appliquée. Si vous rencontrez un tel problème, vous pouvez essayer de résoudre le problème en procédant comme suit.

#### Crash immédiatement après le lancement

Cause possible: le fichier de configuration du client est incorrect.

Méthode de correction: Veuillez vérifier soigneusement le fichier de configuration et le modifier correctement.

#### Invite du client `Socks: version inconnue de Socks:`

Cause possible: le contenu de la configuration du client est défini sur chaussettes et le protocole de proxy du navigateur est défini sur http.

Méthode de correction: modifiez le fichier de configuration pour rendre cohérent le protocole du client entrant et le protocole défini par le proxy du navigateur.

#### Invite du client `Proxy | HTTP: échec de la lecture de la requête http> de la requête HTTP mal formée" \ x05 \ x01 \ x00 "`

Cause possible: inboud configuré par le client est défini sur https et le protocole proxy du navigateur est défini sur socks4 ou socks5.

Méthode de correction: modifiez le fichier de configuration pour rendre cohérent le protocole du client entrant et le protocole défini par le proxy du navigateur.

#### Le serveur exécute `systemctl status v2ray`, l'invite de sortie:` Main: Failed to read config file ... `

Cause possible: le fichier de configuration du serveur est incorrect.

Méthode de correction: Veuillez vérifier soigneusement le fichier de configuration et le corriger.

#### Exécutez les commandes `cat / var / log / v2ray / error.log` ou` systemctl status v2ray`: rejeté Proxy | VMess | Encodage: utilisateur non valide

Cause possible: l'heure système ou l'ID du serveur et du client sont incohérents ou alterId est incohérent.

Méthode de correction: Veuillez calibrer l'heure du système ou modifier l'id et alterId.


#### Après avoir exclu les points ci-dessus, veuillez vérifier attentivement:

1). Le numéro de port indiqué dans les paramètres de proxy du navigateur est cohérent avec le port entrant du client.

2) L'adresse du paramètre sortant dans le client est cohérente avec l'adresse IP du vps;

3) L'adresse du paramètre sortant dans le client est cohérente avec le port entrant du serveur;

4) Si le SMV a activé le pare-feu et bloqué la connexion;

5) Que le client soit installé dans un lieu tel qu'une école ou une entreprise. Si tel est le cas, vérifiez si ces unités disposent d'un pare-feu pour bloquer la connexion.

Pour 1) à 3), vous pouvez vérifier s'il y a un problème en vérifiant la configuration. Pour 4) et 5), vous devez communiquer avec le fournisseur VPS et le gestionnaire de réseau de l'entreprise.

#### Si vous vérifiez les points ci-dessus et éliminez le problème, vous ne pouvez toujours pas accéder à Internet via V2Ray, vous pouvez alors envisager:

1). Lisez attentivement le didacticiel à venir et suivez-le pour éviter de redéployer V2Ray. Faites toujours attention aux points d’attention mentionnés dans [Avant le déploiement] (/ prep / start.md) pendant le déploiement;

2) Abandonne maintenant;

3) Demandez de l'aide à la communauté.

-----

#### Mises à jour

- 2017-08-08 Guide de dépannage supplémentaire
- 2017-08-06 Ajouter un guide de dépannage
- 2018-02-09 Instructions supplémentaires
- 2018-04-05 Supplément de contenu
- 2018-09-03 En raison des mises à jour de V2Ray, modifiez certaines descriptions.
- 2018-11-09 Suivi du format de configuration de la nouvelle version 4.0 +
- 2018-02-01 domainOverride remplacé par sniffing
