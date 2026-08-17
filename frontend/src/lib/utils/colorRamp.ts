export interface Oklch {
	L: number;
	C: number;
	H: number;
}

// Same lightness curve and chroma taper shape used by the built-in
// primary/secondary ramps in ciso-theme.css, so custom brand colors stay
// visually consistent with the rest of the design system.
const STEP_NAMES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
const LIGHTNESS_STEPS = [92.4, 83.9, 75.21, 66.79, 58.49, 51.06, 47.35, 43.48, 39.46, 35.4, 31.33];
const CHROMA_SHAPE = [0.03, 0.07, 0.11, 0.15, 0.19, 0.23, 0.21, 0.19, 0.17, 0.15, 0.13];

function srgbToLinear(c: number): number {
	c /= 255;
	return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

export function hexToOklch(hex: string): Oklch {
	const r = srgbToLinear(parseInt(hex.slice(1, 3), 16));
	const g = srgbToLinear(parseInt(hex.slice(3, 5), 16));
	const b = srgbToLinear(parseInt(hex.slice(5, 7), 16));

	const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
	const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
	const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

	const l_ = Math.cbrt(l);
	const m_ = Math.cbrt(m);
	const s_ = Math.cbrt(s);

	const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
	const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
	const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;

	const C = Math.sqrt(a * a + bb * bb);
	let H = (Math.atan2(bb, a) * 180) / Math.PI;
	if (H < 0) H += 360;

	return { L: L * 100, C, H };
}

/**
 * Generates a full 11-step OKLCH ramp for a brand hex color, reusing the
 * app's existing lightness/chroma-taper shape (see ciso-theme.css) so the
 * result matches the rest of the design system instead of introducing an
 * inconsistent scale.
 */
export function generateRamp(hex: string): Record<(typeof STEP_NAMES)[number], Oklch> {
	const { L, C, H } = hexToOklch(hex);

	let closestIndex = 0;
	let minDiff = Infinity;
	LIGHTNESS_STEPS.forEach((lightness, index) => {
		const diff = Math.abs(lightness - L);
		if (diff < minDiff) {
			minDiff = diff;
			closestIndex = index;
		}
	});

	const referenceChroma = CHROMA_SHAPE[closestIndex];
	const scale = referenceChroma === 0 ? 1 : C / referenceChroma;

	const ramp = {} as Record<(typeof STEP_NAMES)[number], Oklch>;
	STEP_NAMES.forEach((step, index) => {
		ramp[step] = {
			L: LIGHTNESS_STEPS[index],
			C: Math.round(CHROMA_SHAPE[index] * scale * 1000) / 1000,
			H: Math.round(H * 100) / 100
		};
	});
	return ramp;
}

/** Renders a generated ramp as `--color-{prefix}-{step}: oklch(...)` declarations. */
export function rampToCssVars(prefix: 'primary' | 'secondary', ramp: Record<number, Oklch>): string {
	return STEP_NAMES.map(
		(step) => `--color-${prefix}-${step}: oklch(${ramp[step].L}% ${ramp[step].C} ${ramp[step].H}deg);`
	).join('\n');
}
