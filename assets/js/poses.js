// Postures professionnelles de l'avatar (rotations en radians).
// Bras gauche = côté +x (droite de l'écran quand le personnage nous fait face).
export const POSES = {
  neutral: {
    label: 'Prêt',
    shoulderL: [0, 0, 0.1], elbowL: [-0.15, 0, 0], wristL: [0, 0, 0],
    shoulderR: [0, 0, -0.1], elbowR: [-0.15, 0, 0], wristR: [0, 0, 0],
    hipL: [0, 0, 0.02], hipR: [0, 0, -0.02],
  },
  crossed: {
    label: 'Bras croisés',
    spine: [0.02, 0, 0], neck: [-0.04, 0, 0], head: [-0.05, 0.12, 0],
    shoulderL: [-0.35, 0, 0.12], elbowL: [-1.9, -1.15, 0], wristL: [0, 0, 0.2],
    shoulderR: [-0.42, 0, -0.12], elbowR: [-1.95, 1.2, 0], wristR: [0, 0, -0.2],
    hipL: [0, 0, 0.06], hipR: [0, 0, -0.06], ankleL: [0, 0, -0.06], ankleR: [0, 0, 0.06],
  },
  hips: {
    label: 'Mains sur les hanches',
    spine: [-0.03, 0, 0], head: [0.02, -0.08, 0.04],
    shoulderL: [0.15, 0, 0.75], elbowL: [0, 0, -1.9], wristL: [0, 0, 0.3],
    shoulderR: [0.15, 0, -0.75], elbowR: [0, 0, 1.9], wristR: [0, 0, -0.3],
    hipL: [0, 0, 0.1], hipR: [0, 0, -0.1], ankleL: [0, 0, -0.1], ankleR: [0, 0, 0.1],
  },
  thinker: {
    label: 'Main au menton',
    spine: [0.03, -0.1, 0], head: [0.08, 0.15, -0.06],
    shoulderL: [-0.2, 0, 0.12], elbowL: [-1.75, -1.25, 0], wristL: [0, 0, 0],
    shoulderR: [-0.7, 0, -0.05], elbowR: [-2.35, 0.95, 0], wristR: [-0.5, 0, 0],
    hipL: [0, 0, 0.03], hipR: [0, 0, -0.05], kneeR: [0.05, 0, 0],
  },
  present: {
    label: 'Présentation',
    spine: [0, 0.1, 0], head: [0, -0.12, 0],
    shoulderL: [0, 0, 0.12], elbowL: [-0.2, 0, 0], wristL: [0, 0, 0],
    shoulderR: [-0.95, 0, -0.5], elbowR: [-0.45, 0.3, 0], wristR: [-0.3, -0.9, 0],
    hipL: [0, 0, 0.04], hipR: [0, 0, -0.04],
  },
  oneHip: {
    label: 'Une main sur la hanche',
    hipsX: 0.02, spine: [0, 0, -0.04], chest: [0, 0, 0.03], head: [0, 0.1, 0.05],
    shoulderL: [0.15, 0, 0.75], elbowL: [0, 0, -1.9], wristL: [0, 0, 0.3],
    shoulderR: [0, 0, -0.08], elbowR: [-0.2, 0, 0], wristR: [0, 0, 0],
    hipL: [0, 0, 0.04], hipR: [0, 0, -0.12], kneeR: [0.12, 0, 0], ankleR: [-0.1, 0, 0.12],
  },
};

export const POSE_LOOP = ['crossed', 'hips', 'thinker', 'oneHip', 'present'];
