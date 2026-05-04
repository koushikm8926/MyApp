import ImageResizer from 'react-native-image-resizer';

export interface ValidationResult {
  isValid: boolean;
  blurScore: number;
  luminanceScore: number;
  errors: string[];
}

export const imageValidationService = {
  /**
   * Validates image quality based on brightness and sharpness heuristics.
   */
  async validateImage(uri: string): Promise<ValidationResult> {
    const errors: string[] = [];

    try {
      // 1. Resize image to small thumbnail for fast analysis (v1.x API)
      await ImageResizer.createResizedImage(
        uri,
        100,       // width
        100,       // height
        'JPEG',
        70,        // quality 0-100
        0,         // rotation
        undefined  // output path (undefined = temp dir)
      );

      // 2. Analyze Luminance (Brightness) — mock heuristic
      const luminanceScore = this.calculateMockLuminance();
      if (luminanceScore < 30) errors.push('Image is too dark');
      if (luminanceScore > 90) errors.push('Image is overexposed');

      // 3. Analyze Blur (Sharpness) — mock heuristic
      const blurScore = this.calculateMockBlur();
      if (blurScore < 50) errors.push('Image is too blurry');

      return {
        isValid: errors.length === 0,
        blurScore,
        luminanceScore,
        errors,
      };
    } catch (error) {
      console.error('Validation failed', error);
      return {
        isValid: false,
        blurScore: 0,
        luminanceScore: 0,
        errors: ['Could not process image'],
      };
    }
  },

  // Mock functions that simulate AI analysis
  calculateMockLuminance(): number {
    return Math.floor(Math.random() * 60) + 20; // Simulated 20–80 range
  },

  calculateMockBlur(): number {
    return Math.floor(Math.random() * 70) + 30; // Simulated 30–100 range
  },
};
