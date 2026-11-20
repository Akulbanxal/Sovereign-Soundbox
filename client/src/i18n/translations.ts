import type { LanguageCode } from '../types/soundbox';

export interface TranslationDictionary {
  // App Header & Brand
  app_name: string;
  app_tagline: string;
  app_region: string;
  nav_nip47_badge: string;
  nav_connected_receive_only: string;
  nav_warning_pay_permission: string;
  nav_disconnected: string;
  nav_connected_short: string;
  nav_demo_mode_badge: string;
  demo_banner_notice: string;
  demo_btn_simulate_pay: string;
  demo_activate_btn: string;
  demo_exit_btn: string;
  demo_qr_badge: string;
  nav_mute_tooltip_active: string;
  nav_mute_tooltip_muted: string;
  nav_settings_tooltip: string;
  banner_merchant_intro: string;
  banner_guaranteed_rate: string;

  // Checkout Card & Keypad
  greeting_market: string;
  greeting_headline: string;
  sales_today_label: string;
  sales_today_empty: string;
  amount_display_fiat_label: string;
  amount_display_sats_label: string;
  toggle_mode_sats_manual: string;
  toggle_mode_fiat_active: string;
  toggle_mode_offline_warning: string;
  toggle_mode_tooltip: string;
  conversion_rate_approx_sats: string;
  conversion_rate_approx_fiat: string;
  rate_source_prefix: string;
  chip_add_amount: string;
  keypad_clear: string;
  keypad_backspace_title: string;
  btn_generate_qr: string;
  btn_generating: string;

  // Active Invoice Panel
  btn_back_to_keypad: string;
  status_awaiting_settlement: string;
  status_verified_paid: string;
  status_expired: string;
  status_failed: string;
  invoice_title: string;
  invoice_qr_scan_instruction: string;
  btn_copy_invoice: string;
  btn_copied: string;
  label_expires_in: string;
  replay_chime_btn: string;
  proof_drawer_toggle_open: string;
  proof_drawer_toggle_close: string;
  proof_drawer_title: string;
  proof_payment_hash: string;
  proof_preimage_verified: string;
  proof_preimage_unverified: string;
  proof_preimage_label: string;
  proof_bolt11_label: string;
  proof_rate_source: string;
  proof_zero_pii_note: string;

  // Security Gate Checklist (on Active Invoice)
  gate_title: string;
  gate_nip47_relay: string;
  gate_hash_match: string;
  gate_amount_verified: string;
  gate_preimage_proof: string;
  gate_status_waiting: string;
  gate_status_confirmed: string;
  gate_status_rejected: string;

  // Cryptographic Pipeline Strip
  pipeline_title: string;
  pipeline_step1: string;
  pipeline_step1_desc: string;
  pipeline_step2: string;
  pipeline_step2_desc: string;
  pipeline_step3: string;
  pipeline_step3_desc: string;
  pipeline_step4: string;
  pipeline_step4_desc: string;

  // Sample Data Showcase
  sample_badge: string;
  sample_merchant_note: string;

  // 3D Soundbox Hardware Twin
  soundbox_3d_title: string;
  soundbox_drag_hint: string;
  soundbox_state_idle_label: string;
  soundbox_state_idle_subtext: string;
  soundbox_state_pending_label: string;
  soundbox_state_pending_subtext: string;
  soundbox_state_paid_label: string;
  soundbox_state_paid_subtext: string;
  soundbox_state_alert_label: string;
  soundbox_state_alert_subtext: string;
  soundbox_speaker_active: string;
  soundbox_speaker_muted: string;
  soundbox_webgl_fallback: string;
  camera_preset_front: string;
  camera_preset_perspective: string;
  camera_preset_reset: string;
  oled_rejected_no_proof: string;
  oled_ready_sale: string;
  oled_awaiting_payment: string;

  // Audio Waveform Bar
  audio_spectrum_title: string;
  audio_output_active: string;
  audio_output_muted: string;
  audio_volume_label: string;
  audio_btn_unmute: string;
  audio_btn_mute: string;
  audio_test_tone_btn: string;
  audio_test_tone_title: string;

  // Transaction History
  history_title: string;
  history_filter_all: string;
  history_filter_paid: string;
  history_filter_pending: string;
  history_empty_no_wallet: string;
  history_empty_no_wallet_subtext: string;
  history_btn_connect_wallet: string;
  history_empty_connected: string;
  history_empty_connected_subtext: string;
  history_badge_pending: string;
  history_replay_audio_title: string;
  history_idempotency_badge: string;
  history_zero_keys_logged: string;
  history_simulation_badge: string;

  // Printable / Shareable Digital Receipt Modal
  receipt_modal_title: string;
  receipt_brand_header: string;
  receipt_market_tag: string;
  receipt_verified_stamp: string;
  receipt_label_tx_id: string;
  receipt_label_date: string;
  receipt_label_time: string;
  receipt_label_amount_xof: string;
  receipt_label_amount_sats: string;
  receipt_label_exchange_rate: string;
  receipt_label_status: string;
  receipt_label_payment_hash: string;
  receipt_label_preimage: string;
  receipt_security_guarantee: string;
  receipt_btn_print: string;
  receipt_btn_share: string;
  receipt_btn_copied: string;
  receipt_btn_close: string;

  // Wallet Connect Modal
  wallet_modal_title: string;
  wallet_modal_subtitle: string;
  wallet_connected_banner: string;
  wallet_methods_label: string;
  wallet_relay_label: string;
  wallet_pubkey_label: string;
  wallet_balance_label: string;
  wallet_btn_disconnect: string;
  wallet_btn_disconnecting: string;
  wallet_input_label: string;
  wallet_input_placeholder: string;
  wallet_input_helper: string;
  wallet_btn_connect: string;
  wallet_btn_connecting: string;
  wallet_security_box_title: string;
  wallet_security_box_p1: string;
  wallet_security_box_p2: string;
  wallet_warning_pay_perm_title: string;
  wallet_warning_pay_perm_desc: string;

  // Red-Team Sandbox Drawer
  redteam_drawer_badge: string;
  redteam_alert_active: string;
  redteam_drawer_title: string;
  redteam_toggle_hide: string;
  redteam_toggle_show: string;
  redteam_explainer: string;
  redteam_attack1_tag: string;
  redteam_attack1_title: string;
  redteam_attack1_desc: string;
  redteam_attack1_btn: string;
  redteam_attack2_tag: string;
  redteam_attack2_title: string;
  redteam_attack2_desc: string;
  redteam_attack2_btn: string;
  redteam_attack3_tag: string;
  redteam_attack3_title: string;
  redteam_attack3_desc: string;
  redteam_attack3_btn: string;
  redteam_attack4_tag: string;
  redteam_attack4_title: string;
  redteam_attack4_desc: string;
  redteam_attack4_btn: string;
  redteam_attack_pay_tag: string;
  redteam_attack_pay_title: string;
  redteam_attack_pay_desc: string;
  redteam_attack_pay_btn: string;
  redteam_attack_pay_feedback: string;
  redteam_btn_view_twin: string;
  redteam_attack1_feedback: string;
  redteam_attack2_feedback: string;
  redteam_attack3_feedback: string;
  redteam_attack4_feedback: string;
  redteam_logs_title: string;
  redteam_logs_empty: string;

  // Security & Trust Modal
  trust_modal_title: string;
  trust_modal_subtitle: string;
  trust_philosophy_title: string;
  trust_philosophy_quote: string;
  trust_proves_title: string;
  trust_proves_item1: string;
  trust_proves_item2: string;
  trust_proves_item3: string;
  trust_proves_item4: string;
  trust_not_claim_title: string;
  trust_not_claim_item1: string;
  trust_not_claim_item2: string;
  trust_not_claim_item3: string;
  trust_tech_title: string;
  trust_tech_item1_title: string;
  trust_tech_item1_desc: string;
  trust_tech_item2_title: string;
  trust_tech_item2_desc: string;
  trust_tech_item3_title: string;
  trust_tech_item3_desc: string;
  trust_footer_audit: string;
  trust_btn_close: string;

  // Footer
  footer_copyright: string;
  footer_security_link: string;
  footer_status_connected: string;
  footer_status_disconnected: string;
  footer_region_jurisdiction: string;

  // Time & Date Relative Formatting
  time_just_now: string;
  time_minutes_ago: string;
  time_hours_ago: string;
  time_days_ago: string;
}

export const translations: Record<LanguageCode, TranslationDictionary> = {
  fr: {
    // App Header & Brand
    app_name: 'SOVEREIGN SOUNDBOX',
    app_tagline: 'Terminal Merchant POS · NIP-47',
    app_region: 'UEMOA · XOF',
    nav_nip47_badge: 'Règlement NIP-47',
    nav_connected_receive_only: 'Connecté · Lecture Seule',
    nav_warning_pay_permission: 'Avertissement: pay_invoice actif',
    nav_disconnected: 'Non Connecté',
    nav_connected_short: 'Connecté',
    nav_demo_mode_badge: 'Mode Démo (Simulé)',
    demo_banner_notice: 'Mode Démo Actif — Les paiements sont simulés pour tester l’expérience sans nœud Lightning.',
    demo_btn_simulate_pay: '⚡ Simuler le Paiement Client (Phoenix / Blink)',
    demo_activate_btn: 'Activer le Mode Démo',
    demo_exit_btn: 'Quitter la Démo',
    demo_qr_badge: 'Simulation Démo',
    nav_mute_tooltip_active: 'Audio actif (Cliquer pour couper)',
    nav_mute_tooltip_muted: 'Audio coupé (Cliquer pour réactiver)',
    nav_settings_tooltip: 'Paramètres NWC & Nœud Marchand',
    banner_merchant_intro: 'Terminal Marchand : Validation instantanée des paiements Bitcoin Lightning en Franc CFA (XOF)',
    banner_guaranteed_rate: 'Taux indicatif :',

    // Checkout Card & Keypad
    greeting_market: 'Marché Sandaga · Dakar',
    greeting_headline: 'Bonjour ! Bonne vente',
    sales_today_label: 'Ventes vérifiées aujourd’hui',
    sales_today_empty: '0 CFA encaissés',
    amount_display_fiat_label: 'MONTANT À ENCAISSER (XOF)',
    amount_display_sats_label: 'MONTANT DIRECT (SATS)',
    toggle_mode_sats_manual: 'Mode Sats (Manuel)',
    toggle_mode_fiat_active: 'Taux Fiat Actif',
    toggle_mode_offline_warning: 'Hors-ligne · Mode Sats Recommandé',
    toggle_mode_tooltip: 'Basculez en mode Satoshis si le réseau fiat est instable',
    conversion_rate_approx_sats: '≈ {sats} satoshis',
    conversion_rate_approx_fiat: '≈ {fiat} XOF',
    rate_source_prefix: 'Taux :',
    chip_add_amount: '+{amount} CFA',
    keypad_clear: 'Vider',
    keypad_backspace_title: 'Effacer le dernier chiffre',
    btn_generate_qr: 'Générer le QR de Paiement',
    btn_generating: 'Génération en cours…',

    // Active Invoice Panel
    btn_back_to_keypad: 'Retour au clavier',
    status_awaiting_settlement: 'EN ATTENTE DE RÈGLEMENT…',
    status_verified_paid: 'PAIEMENT VÉRIFIÉ · 100% CONFIRMÉ',
    status_expired: 'FACTURE EXPIRÉE',
    status_failed: 'RÈGLEMENT ÉCHOUÉ / REJETÉ',
    invoice_title: 'Facture Lightning POS',
    invoice_qr_scan_instruction: 'Faites scanner ce QR code via Phoenix, Blink, Cash App ou tout portefeuille Lightning.',
    btn_copy_invoice: 'Copier la facture BOLT11',
    btn_copied: 'Facture copiée !',
    label_expires_in: 'Expire dans :',
    replay_chime_btn: 'Réécouter l’annonce vocale',
    proof_drawer_toggle_open: 'Consulter la Preuve Cryptographique',
    proof_drawer_toggle_close: 'Masquer les Détails Cryptographiques',
    proof_drawer_title: 'Preuve de Règlement NIP-47 & Preimage',
    proof_payment_hash: 'Hash de paiement (SHA-256) :',
    proof_preimage_verified: 'Preimage vérifiée cryptographiquement',
    proof_preimage_unverified: 'Preimage non fournie par le portefeuille',
    proof_preimage_label: 'Preimage Lightning :',
    proof_bolt11_label: 'Facture brute BOLT11 :',
    proof_rate_source: 'Source du cours de change :',
    proof_zero_pii_note: 'Ce reçu ne stocke aucune coordonnée client ni clé secrète.',

    // Security Gate Checklist
    gate_title: 'Points de Contrôle de Sécurité Cryptographique',
    gate_nip47_relay: '1. Confirmation du Nœud NIP-47',
    gate_hash_match: '2. Concordance du Hash Facture',
    gate_amount_verified: '3. Montant Reçu ≥ Attendu',
    gate_preimage_proof: '4. Preuve Preimage SHA-256',
    gate_status_waiting: 'En attente',
    gate_status_confirmed: 'Confirmé',
    gate_status_rejected: 'Rejeté',

    // Cryptographic Pipeline Strip
    pipeline_title: 'Pipeline de Vérification Cryptographique',
    pipeline_step1: '1. Facture NWC',
    pipeline_step1_desc: 'BOLT11 généré via relais Nostr',
    pipeline_step2: '2. Nœud Interrogé',
    pipeline_step2_desc: 'Lookup NIP-47 sur le portefeuille',
    pipeline_step3: '3. Preimage SHA-256',
    pipeline_step3_desc: 'Validation mathématique du secret',
    pipeline_step4: '4. Carillon & Voix',
    pipeline_step4_desc: 'Déclenchement sonore unique',
    sample_badge: 'EXEMPLE DÉMO',
    sample_merchant_note: '[EXEMPLE] Vente Marché Sandaga',

    // 3D Soundbox Hardware Twin
    soundbox_3d_title: 'Terminal Physique Soundbox 3D',
    soundbox_drag_hint: 'Faites glisser pour tourner l’appareil (±25°)',
    soundbox_state_idle_label: 'PRÊT · EN ATTENTE',
    soundbox_state_idle_subtext: 'NIP-47 LECTURE SEULE',
    soundbox_state_pending_label: 'XAAR NAÑU · ATTENTE…',
    soundbox_state_pending_subtext: 'EN COURS SUR LE NŒUD',
    soundbox_state_paid_label: 'PAYÉ · 100% VÉRIFIÉ',
    soundbox_state_paid_subtext: 'PREIMAGE CONFIRMÉE',
    soundbox_state_alert_label: 'SPOOF REJETÉ !',
    soundbox_state_alert_subtext: 'AUCUNE PREUVE NŒUD',
    soundbox_speaker_active: 'Haut-parleur actif',
    soundbox_speaker_muted: 'Son désactivé',
    soundbox_webgl_fallback: 'Rendu 3D non disponible sur cet appareil',
    camera_preset_front: 'Face',
    camera_preset_perspective: '3/4 Comptoir',
    camera_preset_reset: 'Réinitialiser',
    oled_rejected_no_proof: 'REJETÉ: AUCUNE PREUVE',
    oled_ready_sale: 'EN ATTENTE DE VENTE',
    oled_awaiting_payment: 'RÈGLEMENT EN ATTENTE…',

    // Audio Waveform Bar
    audio_spectrum_title: 'Spectre Audio Soundbox',
    audio_output_active: 'Sortie vocale active · {vol}%',
    audio_output_muted: 'Haut-parleur désactivé',
    audio_volume_label: 'Volume :',
    audio_btn_unmute: 'Activer le son',
    audio_btn_mute: 'Couper le son',
    audio_test_tone_btn: 'Test Bip (440 Hz)',
    audio_test_tone_title: 'Émet un bip neutre à 440 Hz pour calibrer le haut-parleur',

    // Transaction History
    history_title: 'Historique des Ventes',
    history_filter_all: 'Tous',
    history_filter_paid: 'Vérifiés',
    history_filter_pending: 'En attente',
    history_empty_no_wallet: 'Aucun portefeuille connecté',
    history_empty_no_wallet_subtext: 'Liez votre nœud Lightning via NWC (Alby Hub, Umbrel, etc.) pour commencer à encaisser en direct.',
    history_btn_connect_wallet: 'Connecter un Portefeuille',
    history_empty_connected: 'Prêt pour votre première vente !',
    history_empty_connected_subtext: '1. Saisissez le montant en CFA\n2. Générez le QR Lightning\n3. Écoutez la confirmation vocale',
    history_badge_pending: 'EN ATTENTE',
    history_replay_audio_title: 'Réécouter l’annonce vocale soundbox',
    history_idempotency_badge: 'Idempotence active',
    history_zero_keys_logged: 'Zéro journalisation de clés',
    history_simulation_badge: '[SIMULATION]',

    // Printable / Shareable Digital Receipt Modal
    receipt_modal_title: 'Reçu Numérique de Vente',
    receipt_brand_header: 'SOVEREIGN SOUNDBOX',
    receipt_market_tag: 'Marché Sandaga · Dakar, Sénégal',
    receipt_verified_stamp: 'RÈGLEMENT VÉRIFIÉ',
    receipt_label_tx_id: 'Réf. Facture :',
    receipt_label_date: 'Date :',
    receipt_label_time: 'Heure :',
    receipt_label_amount_xof: 'Montant en CFA :',
    receipt_label_amount_sats: 'Montant en Satoshis :',
    receipt_label_exchange_rate: 'Taux appliqué :',
    receipt_label_status: 'État du règlement :',
    receipt_label_payment_hash: 'Hash de Paiement (SHA-256) :',
    receipt_label_preimage: 'Preuve Preimage :',
    receipt_security_guarantee: 'Ce reçu atteste que les fonds ont été reçus directement sur le nœud du marchand via le protocole Lightning Network sans intermédiaire.',
    receipt_btn_print: 'Imprimer le Reçu',
    receipt_btn_share: 'Copier / Partager',
    receipt_btn_copied: 'Reçu copié !',
    receipt_btn_close: 'Fermer',

    // Wallet Connect Modal
    wallet_modal_title: 'Configuration NWC Lightning',
    wallet_modal_subtitle: 'NIP-47 Nostr Wallet Connect',
    wallet_connected_banner: 'Statut du Nœud Marchand',
    wallet_methods_label: 'Méthodes autorisées :',
    wallet_relay_label: 'Relais Nostr :',
    wallet_pubkey_label: 'Clé publique du nœud :',
    wallet_balance_label: 'Solde du portefeuille :',
    wallet_btn_disconnect: 'Déconnecter le Portefeuille',
    wallet_btn_disconnecting: 'Déconnexion…',
    wallet_input_label: 'Chaîne de connexion NWC (NIP-47)',
    wallet_input_placeholder: 'nostr+walletconnect://...',
    wallet_input_helper: 'Collez une URI NWC créée avec les permissions make_invoice et lookup_invoice uniquement.',
    wallet_btn_connect: 'Tester & Sauvegarder la Connexion',
    wallet_btn_connecting: 'Vérification du Nœud…',
    wallet_security_box_title: 'Sécurité & Moindre Privilège',
    wallet_security_box_p1: 'Le Soundbox ne nécessite JAMAIS la permission de dépenser (pay_invoice).',
    wallet_security_box_p2: 'Votre chaîne de connexion est chiffrée localement en AES-256-GCM et n’est jamais exposée dans les requêtes de statut.',
    wallet_warning_pay_perm_title: 'Avertissement de Sécurité Critique',
    wallet_warning_pay_perm_desc: 'Cette chaîne NWC contient la permission pay_invoice ! Pour une caisse enregistreuse physique, utilisez impérativement une clé en LECTURE SEULE.',

    // Red-Team Sandbox Drawer
    redteam_drawer_badge: 'SIMULATION DEMO — PAS DE VRAIS BTC',
    redteam_alert_active: 'ALERTE ACTIVE: {alert}',
    redteam_drawer_title: 'Bac à Sable Red-Team pour Juges & Auditeurs',
    redteam_toggle_hide: 'Masquer la console',
    redteam_toggle_show: 'Tester les 4 attaques adverses',
    redteam_explainer: 'Ce panneau permet d’évaluer la résilience du Sovereign Soundbox face aux fraudes courantes en boutique physique en Afrique de l’Ouest (faux reçus WhatsApp, paiements non finalisés, rejeu de webhooks).',
    redteam_attack1_tag: 'Spoof Visuel',
    redteam_attack1_title: 'Capture d’écran truquée "Payé"',
    redteam_attack1_desc: 'Le client montre une fausse capture d’écran de portefeuille validé. Le Soundbox interroge le nœud : aucune preuve NIP-47 trouvée.',
    redteam_attack1_btn: 'Déclencher Fausse Capture',
    redteam_attack2_tag: 'HTLC Non Réglé',
    redteam_attack2_title: 'Paiement HTLC en Attente',
    redteam_attack2_desc: 'Paiement routé mais non réclamé (ou état accepted). Le Soundbox refuse tout carillon tant que la preimage n’est pas révélée.',
    redteam_attack2_btn: 'Simuler Facture Suspendue',
    redteam_attack3_tag: 'Attaque par Rejeu',
    redteam_attack3_title: 'Rejeu de Facture Déjà Réglée',
    redteam_attack3_desc: 'Tentative de réutiliser un ancien paiement validé pour repartir avec un deuxième article sans payer.',
    redteam_attack3_btn: 'Tester Rejeu Idempotent',
    redteam_attack4_tag: 'Vrai Règlement',
    redteam_attack4_title: 'Règlement Vérifié avec Preimage',
    redteam_attack4_desc: 'Simulation d’un paiement intègre : le hash correspond, la preimage est validée, le carillon et la voix résonnent.',
    redteam_attack4_btn: 'Simuler Règlement Valide',
    redteam_attack_pay_tag: 'Moindre Privilège',
    redteam_attack_pay_title: 'Tentative pay_invoice Interdite',
    redteam_attack_pay_desc: 'Un attaquant tente d’utiliser la connexion caisse pour dépenser des fonds. Le terminal refuse toute commande sortante.',
    redteam_attack_pay_btn: 'Tester Blocage Retrait',
    redteam_attack_pay_feedback: '[MOINDRE PRIVILÈGE APPLIQUÉ] Clé NIP-47 en lecture seule (make_invoice / lookup_invoice uniquement). Ordre de paiement rejeté.',
    redteam_btn_view_twin: '↑ Voir le Terminal 3D & Reçu',
    redteam_attack1_feedback: '[ATTAQUE BLOQUÉE] Zéro preuve de règlement sur le nœud Lightning. Le haut-parleur reste STRICTEMENT SILENCIEUX.',
    redteam_attack2_feedback: '[HTLC EN ATTENTE] Paiement routé mais secret (preimage) non révélé. Annonce vocale bloquée.',
    redteam_attack3_feedback: '[REJEU BLOQUÉ] Facture déjà réglée. Garde d’idempotence actif : aucune double-annonce possible.',
    redteam_attack4_feedback: '[RÈGLEMENT VÉRIFIÉ] Preimage SHA-256 validée ! Carillon harmonique et annonce vocale émis.',
    redteam_logs_title: 'Journal d’Audit de Sécurité en Direct (SQLite)',
    redteam_logs_empty: 'Aucun événement suspect journalisé pour l’instant.',

    // Security & Trust Modal
    trust_modal_title: 'Modèle de Sécurité & Modèle de Confiance',
    trust_modal_subtitle: 'Sovereign Soundbox · Spécification d’Intégrité pour les Juges et Marchands',
    trust_philosophy_title: 'Principe Fondamental',
    trust_philosophy_quote: '« Ne faites pas confiance à la capture d’écran du client. Faites confiance au règlement cryptographique sur votre nœud. »',
    trust_proves_title: 'Ce que Sovereign Soundbox Prouve',
    trust_proves_item1: 'Règlement effectif : La facture BOLT11 générée spécifiquement pour cette vente est passée à l’état PAID sur le nœud Lightning du marchand.',
    trust_proves_item2: 'Vérification de Preimage : Validation cryptographique SHA-256(preimage) == payment_hash pour éliminer tout risque d’injection de relais.',
    trust_proves_item3: 'Rejet des sous-paiements : Le montant en millisatoshis réglé doit être strictement supérieur ou égal au montant attendu de la facture.',
    trust_proves_item4: 'Idempotence à déclenchement unique : L’annonce vocale en Français/Wolof ne peut retentir qu’une seule fois par facture réglée.',
    trust_not_claim_title: 'Ce que le système ne prétend pas',
    trust_not_claim_item1: 'Pas de prévention hors-bande : Il n’empêche pas un client d’afficher un faux écran sur son propre téléphone ; il rend cette capture inutile car le marchand attend le son.',
    trust_not_claim_item2: 'Non-gardien (Non-custodial) : Sovereign Soundbox ne conserve aucun fonds. L’argent arrive directement sur le nœud du marchand.',
    trust_not_claim_item3: 'Sécurité du nœud distant : Si la clé privée ou le nœud du marchand est compromis à la source, la soundbox ne peut pas réparer une infrastructure défaillante.',
    trust_tech_title: 'Garanties Techniques & Chiffrement',
    trust_tech_item1_title: 'NIP-47 Moindre Privilège',
    trust_tech_item1_desc: 'Uniquement make_invoice & lookup_invoice. La permission pay_invoice est strictement rejetée.',
    trust_tech_item2_title: 'Chiffrement AES-256-GCM',
    trust_tech_item2_desc: 'La chaîne de connexion NWC est chiffrée avec IV aléatoire et balise d’authentification avant stockage SQLite.',
    trust_tech_item3_title: 'Zéro Données Personnelles',
    trust_tech_item3_desc: 'Aucune journalisation de clés privées, secrets ou coordonnées clients dans les journaux d’audit.',
    trust_footer_audit: 'Audité par la suite de tests d’invariants (5/5 tests validés)',
    trust_btn_close: 'Fermer',

    // Footer
    footer_copyright: 'Sovereign Soundbox © 2026 — Bitcoin Lightning POS pour le commerce de proximité',
    footer_security_link: 'Modèle de Sécurité',
    footer_status_connected: 'NIP-47 Connecté',
    footer_status_disconnected: 'NWC Déconnecté',
    footer_region_jurisdiction: 'UEMOA · BCEAO',

    // Time & Date Relative Formatting
    time_just_now: 'À l’instant',
    time_minutes_ago: 'Il y a {n} min',
    time_hours_ago: 'Il y a {n} h',
    time_days_ago: 'Il y a {n} j',
  },

  wo: {
    // App Header & Brand
    app_name: 'SOVEREIGN SOUNDBOX',
    app_tagline: 'Kaa su Koom-koom POS · NIP-47',
    app_region: 'UEMOA · CFA',
    nav_nip47_badge: 'Fay gu wóor NIP-47',
    nav_connected_receive_only: 'Lëkkale na · Jàng rekk',
    nav_warning_pay_permission: 'Moytul: Sañ-sañu yónnee am na',
    nav_disconnected: 'Lëkkaleewul',
    nav_connected_short: 'Lëkkale na',
    nav_demo_mode_badge: 'Kojal Natal (Natt)',
    demo_banner_notice: 'Kojal Natal Dox na — Faktuur yi ak fay gi natt la ngir seet melo soundbox bi te soxlawul nœud Lightning.',
    demo_btn_simulate_pay: '⚡ Natt Fayu Kiliyan bi (Phoenix / Blink)',
    demo_activate_btn: 'Tàmmal Kojal Natal',
    demo_exit_btn: 'Génn ci Natal bi',
    demo_qr_badge: 'Natal bu Natt',
    nav_mute_tooltip_active: 'Ojaal bi mu ngi dox (Kligal ngir tëj)',
    nav_mute_tooltip_muted: 'Ojaal bi tëj na (Kligal ngir ubbil)',
    nav_settings_tooltip: 'Kompig NWC ak Nœud bu Jaaykat bi',
    banner_merchant_intro: 'Kaa su Jaaykat : Dëggal fayu Bitcoin Lightning ci Franc CFA (XOF) ci sa saasi',
    banner_guaranteed_rate: 'Njëg li tey :',

    // Checkout Card & Keypad
    greeting_market: 'Jaaba Sandaga · Ndakaaru',
    greeting_headline: 'Nanga def ! Dalal ak jàmm',
    sales_today_label: 'Jaay yu wóor tey',
    sales_today_empty: '0 CFA lañu jot tey',
    amount_display_fiat_label: 'XAALIS BI NGAY JOT (CFA)',
    amount_display_sats_label: 'XAALIS CI SATS (LOXO)',
    toggle_mode_sats_manual: 'Kojal Sats (Loxo)',
    toggle_mode_fiat_active: 'Njëgu Fiat bu Dox',
    toggle_mode_offline_warning: 'Reso amul · Kojal Sats gën na',
    toggle_mode_tooltip: 'Kojal ci Satoshis su fekkee reso fiat bi dafa doxul',
    conversion_rate_approx_sats: '≈ {sats} satoshis',
    conversion_rate_approx_fiat: '≈ {fiat} CFA',
    rate_source_prefix: 'Njëg :',
    chip_add_amount: '+{amount} CFA',
    keypad_clear: 'Dindi lépp',
    keypad_backspace_title: 'Dindi benn sémb',
    btn_generate_qr: 'Defar QR bu Fay gi',
    btn_generating: 'Mu ngiy defar QR bi…',

    // Active Invoice Panel
    btn_back_to_keypad: 'Délloosaat ci klawiye bi',
    status_awaiting_settlement: 'XAAR NAÑU FAY GI…',
    status_verified_paid: 'FAY GI WÓOR NA · 100% DËGGAL NAÑU KO',
    status_expired: 'WAAXTU WI JEEX NA',
    status_failed: 'FAY GI BÀCCOON NA / NANGUWUÑU KO',
    invoice_title: 'Faktuur Lightning POS',
    invoice_qr_scan_instruction: 'Wanel QR bi kiliyan bi ci Phoenix, Blink, Cash App walla wàllet bu mu yor.',
    btn_copy_invoice: 'Duppi faktuur BOLT11 bi',
    btn_copied: 'Duppi nañu faktuur bi !',
    label_expires_in: 'Waaxtu bi ci des :',
    replay_chime_btn: 'Dégluwaat kàddu gi',
    proof_drawer_toggle_open: 'Xoolal Firnde SHA-256 bi',
    proof_drawer_toggle_close: 'Nëbbal Firnde bi',
    proof_drawer_title: 'Firnde NIP-47 ak Preimage bu wóor',
    proof_payment_hash: 'Hash bu fay gi (SHA-256) :',
    proof_preimage_verified: 'Preimage bi dëggal nañu ko ci SHA-256',
    proof_preimage_unverified: 'Wàllet bi joxewul preimage',
    proof_preimage_label: 'Preimage Lightning :',
    proof_bolt11_label: 'Faktuur BOLT11 bu mat :',
    proof_rate_source: 'Fan lañu jële njëgu btc bi :',
    proof_zero_pii_note: 'Rësu bi tëyeewul benn kumpa walla kàddu gu nëbbu.',

    // Security Gate Checklist
    gate_title: 'Mbaalu Kaarange ak Firnde Cryptographique',
    gate_nip47_relay: '1. Dëggalu Nœud NIP-47',
    gate_hash_match: '2. Hash bu Faktuur bi Tolloo na',
    gate_amount_verified: '3. Xaalis bi Jot ≥ bi Ñu laaj',
    gate_preimage_proof: '4. Firnde Preimage SHA-256',
    gate_status_waiting: 'Mu ngiy xaar',
    gate_status_confirmed: 'Wóor na',
    gate_status_rejected: 'Bàccoon na',

    // Cryptographic Pipeline Strip
    pipeline_title: 'Yoonu Dëggal Kaarange Lightning',
    pipeline_step1: '1. Faktuur NWC',
    pipeline_step1_desc: 'BOLT11 sosu na ci Nostr',
    pipeline_step2: '2. Natt Nœud bi',
    pipeline_step2_desc: 'Lookup NIP-47 ci wàllet bi',
    pipeline_step3: '3. Preimage SHA-256',
    pipeline_step3_desc: 'Dëggalu secret bi ci xam-xam',
    pipeline_step4: '4. Ojaal ak Kàddu',
    pipeline_step4_desc: 'Réy benn yoon rekk',
    sample_badge: 'MISAL DÉMO',
    sample_merchant_note: '[MISAL] Njaay ci Marché Sandaga',

    // 3D Soundbox Hardware Twin
    soundbox_3d_title: 'Jumtukaay bu Dëggu Soundbox 3D',
    soundbox_drag_hint: 'Bësal te xëcc ngir wëral ko (±25°)',
    soundbox_state_idle_label: 'PARÉ NA · XAAR',
    soundbox_state_idle_subtext: 'NIP-47 JÀNG REKK',
    soundbox_state_pending_label: 'XAAR NAÑU FAY GI…',
    soundbox_state_pending_subtext: 'MU NGIY DOX CI NŒUD',
    soundbox_state_paid_label: 'FAY GI WÓOR NA !',
    soundbox_state_paid_subtext: 'PREIMAGE DËGGAL NAÑU KO',
    soundbox_state_alert_label: 'NATAAL BU NANGUWUL !',
    soundbox_state_alert_subtext: 'FIRNDE AMUL CI NŒUD',
    soundbox_speaker_active: 'Ojaal bi mu ngi dox',
    soundbox_speaker_muted: 'Kàddu gi tëj na',
    soundbox_webgl_fallback: 'Rendu 3D bi mënul dox ci aparey bii',
    camera_preset_front: 'Kanam',
    camera_preset_perspective: 'Wàll 3/4',
    camera_preset_reset: 'Deloosi',
    oled_rejected_no_proof: 'DAÑU KO BAÑ: AMUL FIRNDE',
    oled_ready_sale: 'XAAR NAÑU JAAY',
    oled_awaiting_payment: 'XAAR NAÑU FAY GI…',

    // Audio Waveform Bar
    audio_spectrum_title: 'Yéene Ojaali Soundbox',
    audio_output_active: 'Kàddu gi mu ngi dox · {vol}%',
    audio_output_muted: 'Ojaal bi tëj na',
    audio_volume_label: 'Kàddu gi :',
    audio_btn_unmute: 'Ubbil kàddu gi',
    audio_btn_mute: 'Tëj kàddu gi',
    audio_test_tone_btn: 'Natt Bip (440 Hz)',
    audio_test_tone_title: 'Yónnee këllit gu amul pàtt (440 Hz) ngir natt ojaal bi',

    // Transaction History
    history_title: 'Jottu Faktuur yi',
    history_filter_all: 'Lépp',
    history_filter_paid: 'Yu wóor',
    history_filter_pending: 'Yu ñuy xaar',
    history_empty_no_wallet: 'Amul wàllet bu lëkkale ba tey',
    history_empty_no_wallet_subtext: 'Lëkkalel sa nœud Lightning ci NWC (Alby Hub, Umbrel, ak yeneen) ngir tàmbali jaay ci sa saasi.',
    history_btn_connect_wallet: 'Lëkkale ak Wàllet',
    history_empty_connected: 'Paré nga ngir sa njëkk jaay !',
    history_empty_connected_subtext: '1. Dugalal xaalis bi ci CFA\n2. Defaral QR Lightning bi\n3. Déglul kàddu gu wóor gi',
    history_badge_pending: 'XAAR NAÑU',
    history_replay_audio_title: 'Dégluwaat kàddu gu soundbox gi',
    history_idempotency_badge: 'Idempotence dox na',
    history_zero_keys_logged: 'Benn sémb nëbbuwuñu ko',
    history_simulation_badge: '[NATAL REKK]',

    // Printable / Shareable Digital Receipt Modal
    receipt_modal_title: 'Rësu Digitaal bu Jaay gi',
    receipt_brand_header: 'SOVEREIGN SOUNDBOX',
    receipt_market_tag: 'Jaaba Sandaga · Ndakaaru, Senegaal',
    receipt_verified_stamp: 'FAY GU WÓOR TE DËGGU',
    receipt_label_tx_id: 'Kojal Faktuur :',
    receipt_label_date: 'Bés :',
    receipt_label_time: 'Waaxtu :',
    receipt_label_amount_xof: 'Xaalis ci Franc CFA :',
    receipt_label_amount_sats: 'Xaalis ci Satoshis :',
    receipt_label_exchange_rate: 'Njëgu btc bi ñu jël :',
    receipt_label_status: 'Melo fay gi :',
    receipt_label_payment_hash: 'Hash bu Fay gi (SHA-256) :',
    receipt_label_preimage: 'Firnde Preimage :',
    receipt_security_guarantee: 'Rësu bii dafay dëggal ne xaalis bi dugub na ci sa nœud bu bopp ci Lightning Network te amul benn bànkaas bu ci doxante.',
    receipt_btn_print: 'Móol Rësu bi',
    receipt_btn_share: 'Séddoo / Duppi',
    receipt_btn_copied: 'Duppi nañu rësu bi !',
    receipt_btn_close: 'Tëj',

    // Wallet Connect Modal
    wallet_modal_title: 'Kompig NWC Lightning',
    wallet_modal_subtitle: 'NIP-47 Nostr Wallet Connect',
    wallet_connected_banner: 'Melo Nœud bu Jaaykat bi',
    wallet_methods_label: 'Pexe yi mu nangu :',
    wallet_relay_label: 'Rele Nostr :',
    wallet_pubkey_label: 'Caabi bu féex bu nœud bi :',
    wallet_balance_label: 'Xaalis bu nekk ci wàllet bi :',
    wallet_btn_disconnect: 'Tëj Lëkkale gi',
    wallet_btn_disconnecting: 'Mu ngiy tëj…',
    wallet_input_label: 'Liin bu NWC (NIP-47)',
    wallet_input_placeholder: 'nostr+walletconnect://...',
    wallet_input_helper: 'Dugalal liin bu NWC bu am sañ-sañu make_invoice ak lookup_invoice rekk.',
    wallet_btn_connect: 'Natt & Tëye Lëkkale gi',
    wallet_btn_connecting: 'Mu ngiy natt Nœud bi…',
    wallet_security_box_title: 'Kaarange ak Sañ-sañ yu doy',
    wallet_security_box_p1: 'Soundbox bi du mës laaj sañ-sañu yónnee xaalis (pay_invoice).',
    wallet_security_box_p2: 'Sa liin bu NWC dañu koy denc ci AES-256-GCM ci suuf te dunu ko wanel ci rëdd yépp.',
    wallet_warning_pay_perm_title: 'Moytul gu Mag ci Kaarange',
    wallet_warning_pay_perm_desc: 'Liin bii am na sañ-sañu yónnee xaalis (pay_invoice) ! Ci kaa su bitik, fexeel ba nga joxe caabi bu JÀNG REKK.',

    // Red-Team Sandbox Drawer
    redteam_drawer_badge: 'NATAL REKK — DU BTC BU DËGGU',
    redteam_alert_active: 'ALERTE AM NA: {alert}',
    redteam_drawer_title: 'Mbaalu Natt Red-Team ngir Nattkat yi',
    redteam_toggle_hide: 'Nëbbu konsol bi',
    redteam_toggle_show: 'Natt 4 attaque yi',
    redteam_explainer: 'Pano bii dafay maye ñu natt dëggu Sovereign Soundbox su fekkee kiliyan dafa bëgg nax jaaykat bi (nataal yu fowee ci WhatsApp, fay yu yem ci digg, walla rejeu).',
    redteam_attack1_tag: 'Nataal bu Naxee',
    redteam_attack1_title: 'Fausse capture "Fay nañu ko"',
    redteam_attack1_desc: 'Kiliyan bi dafay wane nataal bu naxee ci telefonam. Soundbox bi laaj na nœud bi : amul benn firnde NIP-47.',
    redteam_attack1_btn: 'Dugalal Nataal bu Fowee',
    redteam_attack2_tag: 'HTLC bu Des',
    redteam_attack2_title: 'Fay gu Des ci Digg (HTLC)',
    redteam_attack2_desc: 'Fay gi jaar na waaye jotuñu ko. Soundbox bi du këllit ba kero preimage bi di feeñ.',
    redteam_attack2_btn: 'Natt Faktuur bu Des',
    redteam_attack3_tag: 'Rejeu bu Faktuur',
    redteam_attack3_title: 'Replay bu Faktuur bu Fayoon',
    redteam_attack3_desc: 'Kiliyan bi bëgg na jëfandikoo faktuur bu jëloo yàgg ngir jël yeneen marsandiis te du fay.',
    redteam_attack3_btn: 'Natt Replay bu Idempotent',
    redteam_attack4_tag: 'Fay gu Wóor',
    redteam_attack4_title: 'Fay gu Dëggu ak Preimage',
    redteam_attack4_desc: 'Natt fay gu mat : hash bi tolloo na, preimage bi dëggal nañu ko, ojaal bi këllit na te kàddu gi réy na.',
    redteam_attack4_btn: 'Natt Fay gu Wóor',
    redteam_attack_pay_tag: 'Sañ-sañ yu Doy',
    redteam_attack_pay_title: 'Bañ Yónnee Xaalis (pay_invoice)',
    redteam_attack_pay_desc: 'Nit bëgg na jëfandikoo caabi caisse bi ngir génne xaalis. Soundbox bi du nangu benn yónnee.',
    redteam_attack_pay_btn: 'Natt Bañ Yónnee',
    redteam_attack_pay_feedback: '[SAÑ-SAÑ YU TEEY] NIP-47 Receive-Only rekk lañu nangu (make/lookup invoice). Benn génne xaalis mënul am.',
    redteam_btn_view_twin: '↑ Xoolal Soundbox 3D bi ak Faktuur bi',
    redteam_attack1_feedback: '[NATT BI DAÑU KO BAÑ] Amul benn firnde fay ci nœud Lightning bi. Ojaal bi réyul benn yoon.',
    redteam_attack2_feedback: '[HTLC MU NGII CI YOON] Xaalis bi jotagul secret (preimage). Kàddu gi du réy.',
    redteam_attack3_feedback: '[REJEU BI DAÑU KO TËJ] Faktuur bi fay nañu ko ba noppi. Du këllit ñaari yoon.',
    redteam_attack4_feedback: '[FAY GU WÓOR TE MAT] Preimage SHA-256 dëggu na ! Ojaal bi këllit na te kàddu gi réy na.',
    redteam_logs_title: 'Téere Kumpa bu Kaarange (SQLite)',
    redteam_logs_empty: 'Amul benn jëf ju doy waar bu ñu bind ba léegi.',

    // Security & Trust Modal
    trust_modal_title: 'Melo Kaarange ak Wóor gu Dëggu',
    trust_modal_subtitle: 'Sovereign Soundbox · Li ñu firndeel ngir Nattkat yi ak Jaaykat yi',
    trust_philosophy_title: 'Pàtt gu Mag gi',
    trust_philosophy_quote: '« Bul wóolu nataal bi ci telefon kiliyan bi. Wóolul dëggalu fay gi ci sa nœud bu bopp. »',
    trust_proves_title: 'Li Sovereign Soundbox Di Dëggal',
    trust_proves_item1: 'Fay gu jotu : Faktuur BOLT11 bi ñu defar ngir jaay bii dugg na ci wàlletu jaaykat bi ci melo PAID.',
    trust_proves_item2: 'Firnde Preimage : Validation SHA-256(preimage) == payment_hash ngir fexe ba kenn du injecter ay nax.',
    trust_proves_item3: 'Bañ xaalis bu yem ci digg : Xaalis bi jot war na tolloo walla ëpp li faktuur bi laaj.',
    trust_proves_item4: 'Idempotence gu benn këllit : Kàddu gi ci Wolof/Français du réy lu ëpp benn yoon ci benn faktuur.',
    trust_not_claim_title: 'Li jumtukaay bi waxul ne mën na ko',
    trust_not_claim_item1: 'Bañ nataal ci kow : Mënul tëj kiliyan bi ci mu wane fenni nataal ci telefonam ; waaye dafa koy def lu amul njariñ ndaxte jaaykat bi ojaal bi rekk lay xaar.',
    trust_not_claim_item2: 'Amul dencukaay (Non-custodial) : Sovereign Soundbox tëyewul sa xaalis. Xaalis bi ci sa nœud bopp lay dugg.',
    trust_not_claim_item3: 'Kaarange nœud bi ci biti : Su sa caabi bu nëbbu reere ci biti, soundbox bi mënul dëggal yàqu-yàqu yooyu.',
    trust_tech_title: 'Garanties Techniques & Chiffrement',
    trust_tech_item1_title: 'NIP-47 Sañ-sañ yu Doy',
    trust_tech_item1_desc: 'make_invoice & lookup_invoice rekk. Sañ-sañu pay_invoice dañu koy bañ.',
    trust_tech_item2_title: 'Chiffrement AES-256-GCM',
    trust_tech_item2_desc: 'Liin bu NWC dañu koy tëj ci AES-256-GCM ak IV yu yees laata ñu koy denc ci SQLite.',
    trust_tech_item3_title: 'Amul Kumpa Kiliyan',
    trust_tech_item3_desc: 'Benn tur, nimero telefon, walla caabi bu nëbbu du dugg ci téere kumpa bi.',
    trust_footer_audit: 'Natt nañu ko ci 5/5 tests d’invariants yu wóor',
    trust_btn_close: 'Tëj',

    // Footer
    footer_copyright: 'Sovereign Soundbox © 2026 — Bitcoin Lightning POS bu dëggu ngir jaaykat yi',
    footer_security_link: 'Melo Kaarange',
    footer_status_connected: 'NIP-47 Lëkkale na',
    footer_status_disconnected: 'NWC Tëj na',
    footer_region_jurisdiction: 'UEMOA · BCEAO',

    // Time & Date Relative Formatting
    time_just_now: 'Léegi léegi',
    time_minutes_ago: 'ci {n} simili',
    time_hours_ago: 'ci {n} waxtu',
    time_days_ago: 'ci {n} fan',
  },

  en: {
    // App Header & Brand
    app_name: 'SOVEREIGN SOUNDBOX',
    app_tagline: 'Merchant Terminal POS · NIP-47',
    app_region: 'WAEMU · XOF',
    nav_nip47_badge: 'NIP-47 Settlement',
    nav_connected_receive_only: 'Connected · Receive-Only',
    nav_warning_pay_permission: 'Warning: pay_invoice active',
    nav_disconnected: 'Disconnected',
    nav_connected_short: 'Connected',
    nav_demo_mode_badge: 'Demo Mode (Simulated)',
    demo_banner_notice: 'Demo Mode Active — Payments are simulated to test the soundbox experience without an NWC Lightning node.',
    demo_btn_simulate_pay: '⚡ Simulate Customer Payment (Phoenix / Blink)',
    demo_activate_btn: 'Activate Demo Mode',
    demo_exit_btn: 'Exit Demo Mode',
    demo_qr_badge: 'Demo Simulation',
    nav_mute_tooltip_active: 'Audio active (Click to mute)',
    nav_mute_tooltip_muted: 'Audio muted (Click to unmute)',
    nav_settings_tooltip: 'NWC & Merchant Node Settings',
    banner_merchant_intro: 'Merchant Terminal: Instant settlement-verified Bitcoin Lightning POS in West African Franc (XOF)',
    banner_guaranteed_rate: 'Guaranteed rate:',

    // Checkout Card & Keypad
    greeting_market: 'Sandaga Market · Dakar',
    greeting_headline: 'Welcome! Happy Selling',
    sales_today_label: 'Verified Sales Today',
    sales_today_empty: '0 CFA collected',
    amount_display_fiat_label: 'AMOUNT TO COLLECT (XOF)',
    amount_display_sats_label: 'DIRECT AMOUNT (SATS)',
    toggle_mode_sats_manual: 'Sats Mode (Manual)',
    toggle_mode_fiat_active: 'Fiat Rate Active',
    toggle_mode_offline_warning: 'Offline · Sats Mode Recommended',
    toggle_mode_tooltip: 'Switch to Satoshis if fiat rate feed is unavailable',
    conversion_rate_approx_sats: '≈ {sats} satoshis',
    conversion_rate_approx_fiat: '≈ {fiat} XOF',
    rate_source_prefix: 'Rate:',
    chip_add_amount: '+{amount} CFA',
    keypad_clear: 'Clear',
    keypad_backspace_title: 'Delete last digit',
    btn_generate_qr: 'Generate Payment QR',
    btn_generating: 'Generating invoice…',

    // Active Invoice Panel
    btn_back_to_keypad: 'Back to Keypad',
    status_awaiting_settlement: 'AWAITING SETTLEMENT…',
    status_verified_paid: 'PAYMENT VERIFIED · 100% CONFIRMED',
    status_expired: 'INVOICE EXPIRED',
    status_failed: 'PAYMENT FAILED / REJECTED',
    invoice_title: 'Lightning POS Invoice',
    invoice_qr_scan_instruction: 'Have the customer scan this QR code with Phoenix, Blink, Cash App, or any Lightning wallet.',
    btn_copy_invoice: 'Copy BOLT11 Invoice',
    btn_copied: 'Invoice copied!',
    label_expires_in: 'Expires in:',
    replay_chime_btn: 'Replay audio announcement',
    proof_drawer_toggle_open: 'View Cryptographic Proof',
    proof_drawer_toggle_close: 'Hide Cryptographic Details',
    proof_drawer_title: 'NIP-47 Settlement Proof & Preimage',
    proof_payment_hash: 'Payment Hash (SHA-256):',
    proof_preimage_verified: 'Preimage cryptographically verified',
    proof_preimage_unverified: 'Preimage not provided by wallet',
    proof_preimage_label: 'Lightning Preimage:',
    proof_bolt11_label: 'Raw BOLT11 Invoice:',
    proof_rate_source: 'Exchange rate source:',
    proof_zero_pii_note: 'This receipt stores zero customer identity details and zero private keys.',

    // Security Gate Checklist
    gate_title: 'Cryptographic Security Gate Checklist',
    gate_nip47_relay: '1. NIP-47 Node Response',
    gate_hash_match: '2. Invoice Hash Match',
    gate_amount_verified: '3. Amount Received ≥ Expected',
    gate_preimage_proof: '4. Preimage SHA-256 Proof',
    gate_status_waiting: 'Awaiting',
    gate_status_confirmed: 'Confirmed',
    gate_status_rejected: 'Rejected',

    // Cryptographic Pipeline Strip
    pipeline_title: 'Cryptographic Verification Pipeline',
    pipeline_step1: '1. NWC Invoice',
    pipeline_step1_desc: 'BOLT11 created via Nostr relay',
    pipeline_step2: '2. Wallet Lookup',
    pipeline_step2_desc: 'NIP-47 state polled on node',
    pipeline_step3: '3. Preimage SHA-256',
    pipeline_step3_desc: 'Cryptographic secret verified',
    pipeline_step4: '4. Voice & Chime',
    pipeline_step4_desc: 'Single-trigger audio announced',
    sample_badge: 'SAMPLE DEMO',
    sample_merchant_note: '[SAMPLE] Sandaga Market Sale',

    // 3D Soundbox Hardware Twin
    soundbox_3d_title: '3D Hardware Soundbox Twin',
    soundbox_drag_hint: 'Drag to tilt device (±25°)',
    soundbox_state_idle_label: 'READY FOR PAYMENT',
    soundbox_state_idle_subtext: 'NIP-47 RECEIVE-ONLY',
    soundbox_state_pending_label: 'AWAITING PROOF…',
    soundbox_state_pending_subtext: 'UNCONFIRMED INVOICE',
    soundbox_state_paid_label: 'PAID · VERIFIED',
    soundbox_state_paid_subtext: 'SETTLEMENT CONFIRMED',
    soundbox_state_alert_label: 'SPOOF REJECTED!',
    soundbox_state_alert_subtext: 'NO SETTLEMENT PROOF',
    soundbox_speaker_active: 'Speaker active',
    soundbox_speaker_muted: 'Speaker muted',
    soundbox_webgl_fallback: '3D rendering not available on this device',
    camera_preset_front: 'Front View',
    camera_preset_perspective: '3/4 Angle',
    camera_preset_reset: 'Reset Tilt',
    oled_rejected_no_proof: 'REJECTED: NO PROOF',
    oled_ready_sale: 'READY FOR SALE',
    oled_awaiting_payment: 'AWAITING SETTLEMENT…',

    // Audio Waveform Bar
    audio_spectrum_title: 'Soundbox Audio Spectrum',
    audio_output_active: 'Voice output active · {vol}%',
    audio_output_muted: 'Speaker muted',
    audio_volume_label: 'Volume:',
    audio_btn_unmute: 'Unmute',
    audio_btn_mute: 'Mute',
    audio_test_tone_btn: 'Test Beep (440 Hz)',
    audio_test_tone_title: 'Plays a neutral 440 Hz beep to calibrate the speaker',

    // Transaction History
    history_title: 'Sales History',
    history_filter_all: 'All',
    history_filter_paid: 'Verified',
    history_filter_pending: 'Pending',
    history_empty_no_wallet: 'No wallet connected',
    history_empty_no_wallet_subtext: 'Connect your Lightning node via NWC (Alby Hub, Umbrel, etc.) to start accepting live payments.',
    history_btn_connect_wallet: 'Connect Wallet',
    history_empty_connected: 'Ready for your first sale!',
    history_empty_connected_subtext: '1. Enter CFA amount\n2. Generate Lightning QR\n3. Listen for spoken confirmation',
    history_badge_pending: 'PENDING',
    history_replay_audio_title: 'Replay soundbox voice announcement',
    history_idempotency_badge: 'Idempotence active',
    history_zero_keys_logged: 'Zero keys logged',
    history_simulation_badge: '[SIMULATION]',

    // Printable / Shareable Digital Receipt Modal
    receipt_modal_title: 'Digital Sales Receipt',
    receipt_brand_header: 'SOVEREIGN SOUNDBOX',
    receipt_market_tag: 'Sandaga Market · Dakar, Senegal',
    receipt_verified_stamp: 'SETTLEMENT VERIFIED',
    receipt_label_tx_id: 'Invoice Ref:',
    receipt_label_date: 'Date:',
    receipt_label_time: 'Time:',
    receipt_label_amount_xof: 'Amount in CFA:',
    receipt_label_amount_sats: 'Amount in Satoshis:',
    receipt_label_exchange_rate: 'Applied Rate:',
    receipt_label_status: 'Settlement Status:',
    receipt_label_payment_hash: 'Payment Hash (SHA-256):',
    receipt_label_preimage: 'Preimage Proof:',
    receipt_security_guarantee: 'This receipt proves funds were received directly into the merchant node via the Lightning Network without financial intermediaries.',
    receipt_btn_print: 'Print Receipt',
    receipt_btn_share: 'Copy / Share',
    receipt_btn_copied: 'Receipt copied!',
    receipt_btn_close: 'Close',

    // Wallet Connect Modal
    wallet_modal_title: 'Lightning NWC Configuration',
    wallet_modal_subtitle: 'NIP-47 Nostr Wallet Connect',
    wallet_connected_banner: 'Merchant Node Status',
    wallet_methods_label: 'Authorized methods:',
    wallet_relay_label: 'Nostr Relay:',
    wallet_pubkey_label: 'Node Public Key:',
    wallet_balance_label: 'Wallet Balance:',
    wallet_btn_disconnect: 'Disconnect Wallet',
    wallet_btn_disconnecting: 'Disconnecting…',
    wallet_input_label: 'NWC Connection String (NIP-47)',
    wallet_input_placeholder: 'nostr+walletconnect://...',
    wallet_input_helper: 'Paste an NWC URI created with make_invoice and lookup_invoice permissions only.',
    wallet_btn_connect: 'Test & Save Connection',
    wallet_btn_connecting: 'Verifying Node…',
    wallet_security_box_title: 'Least-Privilege Security',
    wallet_security_box_p1: 'The Soundbox NEVER requires spending permissions (pay_invoice).',
    wallet_security_box_p2: 'Your connection string is encrypted locally with AES-256-GCM and never exposed in status queries.',
    wallet_warning_pay_perm_title: 'Critical Security Warning',
    wallet_warning_pay_perm_desc: 'This NWC string includes pay_invoice permission! For a physical POS terminal, strictly use a RECEIVE-ONLY key.',

    // Red-Team Sandbox Drawer
    redteam_drawer_badge: 'DEMO SIMULATION — NOT REAL BTC',
    redteam_alert_active: 'ACTIVE ALERT: {alert}',
    redteam_drawer_title: 'Red-Team Sandbox for Judges & Auditors',
    redteam_toggle_hide: 'Hide console',
    redteam_toggle_show: 'Test 4 adversarial attacks',
    redteam_explainer: 'This panel tests Sovereign Soundbox against common retail fraud in West Africa (WhatsApp fake receipts, unsettled hold invoices, duplicate replays).',
    redteam_attack1_tag: 'Visual Spoof',
    redteam_attack1_title: 'Fake "Paid" Screenshot',
    redteam_attack1_desc: 'Customer shows a fake payment screenshot. Soundbox queries node: zero NIP-47 settlement found, stays completely silent.',
    redteam_attack1_btn: 'Trigger Fake Screenshot',
    redteam_attack2_tag: 'Unsettled HTLC',
    redteam_attack2_title: 'Pending HTLC Invoice',
    redteam_attack2_desc: 'Payment routed but unclaimed or held. Soundbox refuses to chime until preimage is cryptographically proven.',
    redteam_attack2_btn: 'Simulate Held Invoice',
    redteam_attack3_tag: 'Replay Attack',
    redteam_attack3_title: 'Duplicate Invoice Replay',
    redteam_attack3_desc: 'Customer attempts to reuse an already settled invoice to walk away with a second item.',
    redteam_attack3_btn: 'Test Idempotent Replay',
    redteam_attack4_tag: 'Real Settlement',
    redteam_attack4_title: 'Verified Payment with Preimage',
    redteam_attack4_desc: 'Simulates genuine payment: hash matches, preimage verified, chime sounds, and loud voice announces.',
    redteam_attack4_btn: 'Simulate Valid Settlement',
    redteam_attack_pay_tag: 'Least Privilege',
    redteam_attack_pay_title: 'Unauthorized pay_invoice Block',
    redteam_attack_pay_desc: 'An attacker attempts to use the POS register connection to drain funds. The soundbox strictly rejects outbound spending.',
    redteam_attack_pay_btn: 'Test Drain Block',
    redteam_attack_pay_feedback: '[LEAST PRIVILEGE ENFORCED] Receive-only NIP-47 scope (make_invoice / lookup_invoice). Outbound payment call strictly refused.',
    redteam_btn_view_twin: '↑ View 3D Soundbox & Receipt',
    redteam_attack1_feedback: '[ATTACK BLOCKED] Zero settlement on Lightning node. Speaker stays 100% SILENT.',
    redteam_attack2_feedback: '[HTLC UNSETTLED] Payment routed but preimage not revealed. Voice announcement BLOCKED.',
    redteam_attack3_feedback: '[REPLAY BLOCKED] Invoice already settled once. Idempotent guard prevents double-announcement.',
    redteam_attack4_feedback: '[VERIFIED SETTLEMENT] SHA-256 preimage verified! Harmonic chime & spoken voice announced.',
    redteam_logs_title: 'Live Security Audit Log (SQLite)',
    redteam_logs_empty: 'No security events logged yet.',

    // Security & Trust Modal
    trust_modal_title: 'Security & Trust Invariant Model',
    trust_modal_subtitle: 'Sovereign Soundbox · Integrity Specification for Judges & Merchants',
    trust_philosophy_title: 'Core Philosophy',
    trust_philosophy_quote: '“Don’t trust the customer’s screenshot. Trust the cryptographic settlement on your node.”',
    trust_proves_title: 'What Sovereign Soundbox Proves',
    trust_proves_item1: 'Actual Settlement: The specific BOLT11 invoice generated for this sale has transitioned to PAID on the merchant node.',
    trust_proves_item2: 'Preimage Verification: Cryptographic SHA-256(preimage) == payment_hash check eliminates relay injection risk.',
    trust_proves_item3: 'Underpayment Rejection: Settled millisatoshis must be strictly greater than or equal to expected amount.',
    trust_proves_item4: 'Single-Trigger Idempotency: Spoken voice chime triggers exactly once per settled invoice.',
    trust_not_claim_title: 'What the System Does NOT Claim',
    trust_not_claim_item1: 'No Off-Band Phone Control: It does not prevent customers from showing fake phone screens; it makes customer screens irrelevant because merchants wait for the sound.',
    trust_not_claim_item2: 'Non-Custodial: Sovereign Soundbox never holds funds. Money arrives directly in the merchant’s sovereign node.',
    trust_not_claim_item3: 'Remote Node Security: If the merchant’s master keys are compromised at the source, the soundbox cannot repair upstream failures.',
    trust_tech_title: 'Technical Guarantees & Encryption',
    trust_tech_item1_title: 'Least-Privilege NIP-47',
    trust_tech_item1_desc: 'make_invoice & lookup_invoice only. pay_invoice permission is strictly rejected.',
    trust_tech_item2_title: 'AES-256-GCM Encryption',
    trust_tech_item2_desc: 'The NWC connection string is encrypted with a random IV and auth tag before SQLite storage.',
    trust_tech_item3_title: 'Zero PII Policy',
    trust_tech_item3_desc: 'No customer phone numbers, names, or private keys are ever stored in audit logs.',
    trust_footer_audit: 'Audited by settlement invariant test suite (5/5 tests passing)',
    trust_btn_close: 'Close',

    // Footer
    footer_copyright: 'Sovereign Soundbox © 2026 — Bitcoin Lightning POS for community commerce',
    footer_security_link: 'Security Model',
    footer_status_connected: 'NIP-47 Connected',
    footer_status_disconnected: 'NWC Disconnected',
    footer_region_jurisdiction: 'WAEMU · BCEAO',

    // Time & Date Relative Formatting
    time_just_now: 'Just now',
    time_minutes_ago: '{n}m ago',
    time_hours_ago: '{n}h ago',
    time_days_ago: '{n}d ago',
  },
};

export type TranslationKey = keyof TranslationDictionary;

