# MediPlus - Frontend

Plateforme e-Santé intelligente pour la gestion des rendez-vous médicaux, téléconsultations et prescriptions.

## Technologies

- **React 19** - Framework frontend moderne
- **Vite** - Outil de build ultra-rapide
- **Tailwind CSS** - Framework CSS utilitaire
- **React Router** - Routage côté client
- **React Query** - Gestion d'état serveur
- **Zustand** - Gestion d'état client

## Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la build de production
npm run preview
```

## Scripts disponibles

- `npm run dev` - Serveur de développement
- `npm run build` - Build de production optimisé
- `npm run lint` - Vérification du code
- `npm run lint:fix` - Correction automatique du code
- `npm run test` - Exécution des tests
- `npm run clean` - Nettoyage des fichiers temporaires

## Fonctionnalités

- **Dashboard Patient** - Gestion des rendez-vous et prescriptions
- **Dashboard Professionnel** - Gestion des patients et calendrier
- **Dashboard Admin** - Gestion globale de la plateforme
- **Téléconsultation** - Consultations médicales à distance
- **Triage IA** - Évaluation automatique des symptômes
- **Carte interactive** - Localisation des professionnels de santé

## Sécurité

- Authentification JWT avec Laravel Sanctum
- Chiffrement des données médicales
- Conformité RGPD
- Validation côté client et serveur

## Responsive

Design adaptatif pour tous les appareils :

- Mobile (320px+)
- Tablette (768px+)
- Desktop (1024px+)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## Support

Pour toute question ou support technique :

- Email : support@mediplus.ci
- Documentation : [docs.mediplus.ci](https://docs.mediplus.ci)
