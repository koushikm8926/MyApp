export interface InspectionStep {
  id: string;
  label: string;
  description: string;
  icon: string;
  required: boolean;
}

export const INSPECTION_STEPS: InspectionStep[] = [
  {
    id: 'EXTERIOR_FRONT',
    label: 'Exterior Front',
    description: 'Capture the front view of the vehicle clearly.',
    icon: 'car',
    required: true,
  },
  {
    id: 'EXTERIOR_REAR',
    label: 'Exterior Rear',
    description: 'Capture the rear view of the vehicle.',
    icon: 'car',
    required: true,
  },
  {
    id: 'EXTERIOR_LEFT',
    label: 'Exterior Left',
    description: 'Capture the driver side of the vehicle.',
    icon: 'car',
    required: true,
  },
  {
    id: 'EXTERIOR_RIGHT',
    label: 'Exterior Right',
    description: 'Capture the passenger side of the vehicle.',
    icon: 'car',
    required: true,
  },
  {
    id: 'INTERIOR_DASHBOARD',
    label: 'Dashboard & Controls',
    description: 'Focus on the dashboard, steering wheel, and central console.',
    icon: 'layout',
    required: true,
  },
  {
    id: 'ODOMETER',
    label: 'Odometer Reading',
    description: 'Clear photo of the current mileage on the instrument cluster.',
    icon: 'gauge',
    required: true,
  },
  {
    id: 'ENGINE_BAY',
    label: 'Engine Compartment',
    description: 'Open the hood and capture the engine bay.',
    icon: 'cpu',
    required: false,
  },
  {
    id: 'TIRES',
    label: 'Tires & Wheels',
    description: 'Check tire tread and wheel condition.',
    icon: 'circle',
    required: false,
  },
];
