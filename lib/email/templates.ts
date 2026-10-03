/**
 * Business-Grade Transactional Email Templates for Tâches.ma
 * Parity with Workzilla, UNU, and Upwork workflows.
 */

import {
  renderEmailHtml,
  renderEmailPlainText,
  BaseEmailOptions,
} from './baseTemplate';

export interface EmailRenderResult {
  subject: string;
  html: string;
  text: string;
}

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://taches.ma';

/**
 * 1. CLIENT CONFIRMATION (Workzilla Parity)
 * Triggered when Customer clicks "Confirmer la mission / Libérer les fonds"
 */
export interface TaskConfirmedClientEmailData {
  clientName: string;
  contractorName: string;
  taskTitle: string;
  taskId: string;
  amountDH: number;
  completedAt?: string;
}

export function buildTaskConfirmedClientEmail(
  data: TaskConfirmedClientEmailData
): EmailRenderResult {
  const shortId = data.taskId.slice(0, 8);
  const taskUrl = `${APP_URL}/fr/task/${data.taskId}`;
  const subject = `[Tâches.ma] Confirmation de mission : "${data.taskTitle}" clôturée avec succès`;

  const options: BaseEmailOptions = {
    preheader: `Votre mission "${data.taskTitle}" est validée et les fonds ont été transférés.`,
    badge: {
      text: 'Mission Clôturée & Paiement Validé',
      variant: 'success',
    },
    headline: 'Mission validée avec succès !',
    subtitle: 'Les fonds sous séquestre Daman ont été transférés au prestataire.',
    greetingName: data.clientName || 'Donneur d\'ordre',
    paragraphs: [
      `Vous venez de confirmer la bonne exécution de la mission <strong>&laquo;&nbsp;${data.taskTitle}&nbsp;&raquo;</strong> et d'autoriser le transfert des fonds au prestataire <strong>${data.contractorName}</strong>.`,
      `Pensez à sauvegarder les livrables, rapports et pièces jointes reçus dans votre espace de discussion. Par mesure de confidentialité et de gestion des données, les conversations et pièces jointes sont conservées en ligne sur la plateforme pendant six mois.`,
    ],
    dataRows: [
      { label: 'Référence Mission', value: `#${shortId}` },
      { label: 'Titre de la mission', value: data.taskTitle },
      { label: 'Prestataire retenu', value: data.contractorName },
      { label: 'Montant transféré', value: `${data.amountDH} DH`, highlight: true },
      { label: 'Protection Daman', value: 'Séquestre libéré avec succès' },
    ],
    calloutBox: {
      title: 'Besoin d\'une facture ou d\'une réclamation ?',
      text: 'Votre reçu d\'opération est disponible dans votre espace personnel. Vous disposez de la garantie Tâches.ma pour toute question relative à cette mission.',
      icon: 'shield',
    },
    primaryAction: {
      label: 'Accéder à la mission et laisser un avis',
      url: taskUrl,
      variant: 'primary',
    },
    secondaryAction: {
      label: 'Publier une nouvelle mission',
      url: `${APP_URL}/fr/task/new`,
    },
    footerNote:
      'Merci de votre confiance. Pour toute assistance, nos conseillers sont à votre écoute 7j/7.',
  };

  return {
    subject,
    html: renderEmailHtml(options),
    text: renderEmailPlainText(options),
  };
}

/**
 * 2. CONTRACTOR ESCROW RELEASE (Workzilla Parity)
 * Triggered when Customer releases escrow funds to the performer
 */
export interface TaskCompletedPerformerEmailData {
  performerName: string;
  clientName: string;
  taskTitle: string;
  taskId: string;
  grossRewardDH: number;
  platformFeeDH: number;
  netGainDH: number;
  newBalanceAvailableDH?: number;
}

export function buildTaskCompletedPerformerEmail(
  data: TaskCompletedPerformerEmailData
): EmailRenderResult {
  const shortId = data.taskId.slice(0, 8);
  const taskUrl = `${APP_URL}/fr/task/${data.taskId}`;
  const walletUrl = `${APP_URL}/fr/wallet`;
  const subject = `[Tâches.ma] Félicitations ! Vos gains de ${data.netGainDH} DH sont débloqués`;

  const options: BaseEmailOptions = {
    preheader: `Vos gains de ${data.netGainDH} DH pour la mission "${data.taskTitle}" sont disponibles sur votre solde.`,
    badge: {
      text: 'Paiement Reçu & Débloqué',
      variant: 'success',
    },
    headline: 'Vos gains sont débloqués !',
    subtitle: `Le client ${data.clientName} a validé votre travail avec succès.`,
    greetingName: data.performerName || 'Prestataire',
    paragraphs: [
      `Excellente nouvelle ! Le donneur d'ordre <strong>${data.clientName}</strong> a officiellement approuvé votre livrable pour la mission <strong>&laquo;&nbsp;${data.taskTitle}&nbsp;&raquo;</strong>.`,
      `Le séquestre financier a été libéré : votre rémunération nette a été créditée instantanément sur votre solde disponible Tâches.ma. Vous pouvez la retirer à tout moment par virement bancaire (CIH, Attijariwafa, BMCE...) ou via nos partenaires.`,
    ],
    dataRows: [
      { label: 'Mission', value: `#${shortId} - ${data.taskTitle}` },
      { label: 'Client', value: data.clientName },
      { label: 'Rémunération brute', value: `${data.grossRewardDH} DH` },
      { label: 'Frais de service (15%)', value: `-${data.platformFeeDH} DH` },
      { label: 'Gains nets crédités', value: `+${data.netGainDH} DH`, highlight: true },
      { label: 'Expérience acquise', value: '+25 XP Pro' },
    ],
    calloutBox: {
      title: 'Progression de votre profil',
      text: 'Chaque mission réussie améliore votre note globale et vous positionne en tête de liste pour les futures opportunités à haute rémunération.',
      icon: 'star',
    },
    primaryAction: {
      label: 'Accéder à mon portefeuille',
      url: walletUrl,
      variant: 'success',
    },
    secondaryAction: {
      label: 'Voir la mission',
      url: taskUrl,
    },
    footerNote:
      'Vous pouvez demander un virement bancaire directement depuis votre tableau de bord.',
  };

  return {
    subject,
    html: renderEmailHtml(options),
    text: renderEmailPlainText(options),
  };
}

/**
 * 3. SUBMISSION READY FOR REVIEW (Workzilla Parity)
 * Triggered when Contractor posts a deliverable/report
 */
export interface SubmissionReceivedClientEmailData {
  clientName: string;
  performerName: string;
  taskTitle: string;
  taskId: string;
  reportPreview?: string;
  proofsCount?: number;
}

export function buildSubmissionReceivedClientEmail(
  data: SubmissionReceivedClientEmailData
): EmailRenderResult {
  const shortId = data.taskId.slice(0, 8);
  const taskUrl = `${APP_URL}/fr/task/${data.taskId}`;
  const subject = `[Tâches.ma] Livrable déposé pour votre mission : "${data.taskTitle}"`;

  const options: BaseEmailOptions = {
    preheader: `${data.performerName} a soumis son livrable pour la mission "${data.taskTitle}".`,
    badge: {
      text: 'Livrable en Attente de Revue',
      variant: 'brand',
    },
    headline: 'Votre prestataire a déposé son travail !',
    subtitle: 'Vérifiez les livrables avant de confirmer la mission.',
    greetingName: data.clientName || 'Donneur d\'ordre',
    paragraphs: [
      `Le prestataire <strong>${data.performerName}</strong> a terminé l'exécution de votre mission <strong>&laquo;&nbsp;${data.taskTitle}&nbsp;&raquo;</strong> et a déposé son rapport d'exécution ainsi que ses preuves de travail.`,
      `Vous disposez d'un délai pour examiner attentivement le travail fourni. Si tout est conforme, validez simplement la mission pour débloquer les fonds au prestataire. Si des ajustements sont nécessaires, vous pouvez demander une révision directe.`,
    ],
    dataRows: [
      { label: 'Mission', value: `#${shortId} - ${data.taskTitle}` },
      { label: 'Prestataire', value: data.performerName },
      {
        label: 'Aperçu du rapport',
        value: data.reportPreview ? `"${data.reportPreview.slice(0, 80)}..."` : 'Rapport complet déposé',
      },
      { label: 'Preuves & Fichiers', value: `${data.proofsCount || 1} élément(s) joint(s)` },
    ],
    calloutBox: {
      title: 'Garantie Séquestre Daman active',
      text: 'Vos fonds restent en sécurité sous séquestre jusqu\'à votre validation expresse. Prenez le temps de vérifier la conformité du travail.',
      icon: 'shield',
    },
    primaryAction: {
      label: 'Examiner le livrable maintenant',
      url: taskUrl,
      variant: 'primary',
    },
    footerNote:
      'Sans action de votre part sous le délai imparti, la mission pourra être clôturée automatiquement.',
  };

  return {
    subject,
    html: renderEmailHtml(options),
    text: renderEmailPlainText(options),
  };
}

/**
 * 4. NEW BID / APPLICANT RECEIVED (Workzilla Parity)
 * Triggered when a Contractor bids on a Client's task
 */
export interface NewBidClientEmailData {
  clientName: string;
  performerName: string;
  performerTier?: string;
  performerRating?: number;
  taskTitle: string;
  taskId: string;
  proposedHours?: number;
  pitchPreview?: string;
}

export function buildNewBidClientEmail(
  data: NewBidClientEmailData
): EmailRenderResult {
  const shortId = data.taskId.slice(0, 8);
  const taskUrl = `${APP_URL}/fr/task/${data.taskId}`;
  const subject = `[Tâches.ma] Nouvelle candidature reçue pour "${data.taskTitle}"`;

  const ratingStr = data.performerRating ? `${data.performerRating.toFixed(1)}/5 ★` : 'Nouveau';

  const options: BaseEmailOptions = {
    preheader: `${data.performerName} souhaite réaliser votre mission "${data.taskTitle}".`,
    badge: {
      text: 'Nouvelle Candidature',
      variant: 'info',
    },
    headline: 'Un prestataire qualifié a postulé !',
    subtitle: 'Consultez sa proposition et démarrez la mission.',
    greetingName: data.clientName || 'Donneur d\'ordre',
    paragraphs: [
      `Le prestataire <strong>${data.performerName}</strong> vient de déposer sa candidature pour exécuter votre mission <strong>&laquo;&nbsp;${data.taskTitle}&nbsp;&raquo;</strong>.`,
      `Consultez son profil vérifié, ses réalisations passées et son message de motivation pour choisir le meilleur profil pour votre besoin.`,
    ],
    dataRows: [
      { label: 'Mission', value: `#${shortId} - ${data.taskTitle}` },
      { label: 'Prestataire', value: data.performerName },
      { label: 'Note & Évaluation', value: ratingStr },
      { label: 'Délai proposé', value: `${data.proposedHours || 24} heures` },
      {
        label: 'Message',
        value: data.pitchPreview ? `"${data.pitchPreview.slice(0, 90)}..."` : 'Candidature déposée',
      },
    ],
    primaryAction: {
      label: 'Consulter la proposition & Assigner',
      url: taskUrl,
      variant: 'primary',
    },
    footerNote:
      'Astuce : Recrutez rapidement pour garantir une livraison dans les meilleurs délais.',
  };

  return {
    subject,
    html: renderEmailHtml(options),
    text: renderEmailPlainText(options),
  };
}

/**
 * 5. PAYOUT NOTIFICATION (Workzilla Parity)
 * Triggered on payout status change
 */
export interface PayoutEmailData {
  recipientName: string;
  amountDH: number;
  netAmountDH: number;
  feeDH: number;
  payoutMethod: string;
  trackingReference: string;
  status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  rejectionReason?: string;
}

export function buildPayoutStatusEmail(
  data: PayoutEmailData
): EmailRenderResult {
  const isCompleted = data.status === 'COMPLETED';
  const isCancelled = data.status === 'CANCELLED';

  let subject = `[Tâches.ma] Virement de ${data.netAmountDH} DH en cours d'exécution`;
  let headline = 'Virement en cours de traitement';
  let badgeVariant: 'warning' | 'success' | 'info' = 'warning';
  let badgeText = 'Virement En Cours';

  if (isCompleted) {
    subject = `[Tâches.ma] Virement de ${data.netAmountDH} DH envoyé avec succès !`;
    headline = 'Votre virement a été envoyé !';
    badgeVariant = 'success';
    badgeText = 'Virement Exécuté';
  } else if (isCancelled) {
    subject = `[Tâches.ma] Information concernant votre demande de retrait de ${data.amountDH} DH`;
    headline = 'Demande de virement refusée';
    badgeVariant = 'warning';
    badgeText = 'Demande Annulée';
  }

  const paragraphs = isCompleted
    ? [
        `Nous vous confirmons que votre virement de <strong>${data.netAmountDH} DH</strong> a été exécuté avec succès vers votre moyen de paiement <strong>${data.payoutMethod}</strong>.`,
        `Selon les délais interbancaires au Maroc, les fonds apparaîtront sur votre relevé sous 24 à 48 heures ouvrables.`,
      ]
    : isCancelled
    ? [
        `Votre demande de retrait de <strong>${data.amountDH} DH</strong> n'a pas pu être validée pour le motif suivant :`,
        `<strong>${data.rejectionReason || 'Coordonnées bancaires invalides ou vérification KYC requise.'}</strong>`,
        `Le montant a été recrédité immédiatement sur votre solde disponible Tâches.ma. Vous pouvez soumettre une nouvelle demande en vérifiant vos informations.`,
      ]
    : [
        `Votre demande de retrait de <strong>${data.netAmountDH} DH</strong> a été validée par notre service comptabilité et est en cours d'exécution.`,
        `Vous recevrez une confirmation dès l'émission définitive du virement.`,
      ];

  const options: BaseEmailOptions = {
    preheader: subject,
    badge: {
      text: badgeText,
      variant: badgeVariant,
    },
    headline,
    greetingName: data.recipientName || 'Prestataire',
    paragraphs,
    dataRows: [
      { label: 'Montant demandé', value: `${data.amountDH} DH` },
      { label: 'Montant net versé', value: `${data.netAmountDH} DH`, highlight: isCompleted },
      { label: 'Mode de paiement', value: data.payoutMethod },
      { label: 'Référence de suivi', value: data.trackingReference },
      { label: 'Statut de l\'opération', value: badgeText },
    ],
    primaryAction: {
      label: 'Accéder à mon portefeuille',
      url: `${APP_URL}/fr/wallet`,
      variant: isCompleted ? 'success' : 'primary',
    },
    footerNote:
      'Une interrogation sur vos virements ? Contactez notre service financier à compta@taches.ma.',
  };

  return {
    subject,
    html: renderEmailHtml(options),
    text: renderEmailPlainText(options),
  };
}
