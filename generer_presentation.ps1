# Script PowerShell pour générer la présentation FuturePath automatiquement
try {
    $pptx = New-Object -ComObject PowerPoint.Application
    $pres = $pptx.Presentations.Add()
    $pptx.Visible = [Microsoft.Office.Core.MsoTriState]::msoTrue

    function Add-Slide($title, $content) {
        $slide = $pres.Slides.Add($pres.Slides.Count + 1, [Microsoft.Office.Interop.PowerPoint.PpSlideLayout]::ppLayoutText)
        $slide.Shapes.Item(1).TextFrame.TextRange.Text = $title
        $slide.Shapes.Item(2).TextFrame.TextRange.Text = $content
    }

    # Slide 1 : Titre
    $titleSlide = $pres.Slides.Add(1, [Microsoft.Office.Interop.PowerPoint.PpSlideLayout]::ppLayoutTitle)
    $titleSlide.Shapes.Item(1).TextFrame.TextRange.Text = "FUTUREPATH"
    $titleSlide.Shapes.Item(2).TextFrame.TextRange.Text = "L'Application Mobile au Service de l'Avenir de la Jeunesse`n`nPrésentation aux Bailleurs de Fonds"

    # Slide 2 : Problématique
    Add-Slide "Problématique" "- Information fragmentée et peu fiable`n- Manque d'outils adaptés aux usages mobiles`n- Inégalité d'accès aux opportunités stratégiques`n- Prolifération de fausses annonces sur les réseaux sociaux"

    # Slide 3 : La Solution
    Add-Slide "La Solution FuturePath" "- Application Mobile innovante (PWA)`n- Centralisation intelligente des offres`n- Curation de confiance : chaque offre est vérifiée par un admin`n- Expérience utilisateur fluide et sécurisée"

    # Slide 4 : Alignement ODD (Impact Social)
    Add-Slide "Alignement ODD (Objectifs de Développement Durable)" "- ODD 4 : Éducation de Qualité (Bourses & Formations)`n- ODD 8 : Travail Décent et Insertion Professionnelle`n- ODD 10 : Réduction des Inégalités d'accès à l'information"

    # Slide 5 : Fonctionnalités Mobiles
    Add-Slide "Fonctionnalités Clés" "- Recherche et filtres intelligents (Lieu, Type, Catégorie)`n- Système de sauvegarde et de likes`n- Postulation directe en un clic via lien externe`n- Interface moderne et réactive (Dark Mode)"

    # Slide 6 : Confiance et Modération
    Add-Slide "Confiance & Sécurité" "- Dashboard Administrateur dédié`n- Vérification manuelle de chaque entreprise`n- Zéro Spam : Garantie de fiabilité pour les candidats`n- Protection complète des données utilisateurs"

    # Slide 7 : Avantage Technologique
    Add-Slide "Pourquoi la PWA (Mobile Hybrid) ?" "- Installation instantanée sur l'écran d'accueil`n- Pas de barrière de téléchargement (Stores)`n- Un seul code pour Android et iOS`n- Performance optimale et légèreté"

    # Slide 8 : Budget et Planning
    Add-Slide "Budget & Vision" "- Développement & Sécurité (35%)`n- Marketing & Acquisition (35%)`n- Opérations & Qualité (30%)`n`nPlanning : Pilote (Mois 2) -> Déploiement National (Mois 6)"

    # Slide 9 : Conclusion
    Add-Slide "Conclusion" "- FuturePath : Plus qu'une application, un partenaire de carrière`n- Investir dans la jeunesse, c'est investir dans l'avenir`n`nContact : [Votre Email] / GitHub : anny123-12"

    Write-Host "Le document PowerPoint a été généré avec succès !"
} catch {
    Write-Error "Erreur : Vérifiez que Microsoft PowerPoint est bien installé sur cet ordinateur."
}
