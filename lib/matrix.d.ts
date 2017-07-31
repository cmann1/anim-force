declare class Matrix
{
	constructor(context?:CanvasRenderingContext2D);

	/**
	 * Flips the horizontal values.
	 */
	flipX();
	/**
	 * Flips the vertical values.
	 */
	flipY();
	/**
	 * Short-hand to reset current matrix to an identity matrix.
	 */
	reset();
	/**
	 * Rotates current matrix accumulative by angle.
	 * @param {number} angle - angle in radians
	 */
	rotate(angle);
	/**
	 * Helper method to make a rotation based on an angle in degrees.
	 * @param {number} angle - angle in degrees
	 */
	rotateDeg(angle);
	/**
	 * Scales current matrix accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 * @param {number} sy - scale factor y (1 does nothing)
	 */
	scale(sx, sy);
	/**
	 * Scales current matrix on x axis accumulative.
	 * @param {number} sx - scale factor x (1 does nothing)
	 */
	scaleX(sx);
	/**
	 * Scales current matrix on y axis accumulative.
	 * @param {number} sy - scale factor y (1 does nothing)
	 */
	scaleY(sy);
	/**
	 * Apply skew to the current matrix accumulative.
	 * @param {number} sx - amount of skew for x
	 * @param {number} sy - amount of skew for y
	 */
	skew(sx, sy);
	/**
	 * Apply skew for x to the current matrix accumulative.
	 * @param {number} sx - amount of skew for x
	 */
	skewX(sx);
	/**
	 * Apply skew for y to the current matrix accumulative.
	 * @param {number} sy - amount of skew for y
	 */
	skewY(sy);
	/**
	 * Set current matrix to new absolute matrix.
	 * @param {number} a - scale x
	 * @param {number} b - skew y
	 * @param {number} c - skew x
	 * @param {number} d - scale y
	 * @param {number} e - translate x
	 * @param {number} f - translate y
	 */
	setTransform(a, b, c, d, e, f);
	/**
	 * Set current matrix to new absolute matrix.
	 * @param {Matrix} m
	 */
	setFrom(m);
	/**
	 * Translate current matrix accumulative.
	 * @param {number} tx - translation for x
	 * @param {number} ty - translation for y
	 */
	translate(tx, ty);
	/**
	 * Translate current matrix on x axis accumulative.
	 * @param {number} tx - translation for x
	 */
	translateX(tx);
	/**
	 * Translate current matrix on y axis accumulative.
	 * @param {number} ty - translation for y
	 */
	translateY(ty);
	/**
	 * Multiplies current matrix with new matrix values.
	 * @param {number} a2 - scale x
	 * @param {number} b2 - skew y
	 * @param {number} c2 - skew x
	 * @param {number} d2 - scale y
	 * @param {number} e2 - translate x
	 * @param {number} f2 - translate y
	 */
	transform(a2, b2, c2, d2, e2, f2);
	/**
	 * Get an inverse matrix of current matrix. The method returns a new
	 * matrix with values you need to use to get to an identity matrix.
	 * Context from parent matrix is not applied to the returned matrix.
	 * @returns {Matrix}
	 */
	getInverse();
	/**
	 * Interpolate this matrix with another and produce a new matrix.
	 * t is a value in the range [0.0, 1.0] where 0 is this instance and
	 * 1 is equal to the second matrix. The t value is not constrained.
	 *
	 * Context from parent matrix is not applied to the returned matrix.
	 *
	 * @param {Matrix} m2 - the matrix to interpolate with.
	 * @param {number} t - interpolation [0.0, 1.0]
	 * @returns {Matrix} - new instance with the interpolated result
	 */
	interpolate(m2, t);
	/**
	 * Apply current matrix to x and y point.
	 * Returns a point object.
	 *
	 * @param {number} x - value for x
	 * @param {number} y - value for y
	 * @returns {{x: number, y: number}} A new transformed point object
	 */
	applyToPoint(x, y);
	/**
	 * Apply current matrix to array with point objects or point pairs.
	 * Returns a new array with points in the same format as the input array.
	 *
	 * A point object is an object literal:
	 *
	 * {x: x, y: y}
	 *
	 * so an array would contain either:
	 *
	 * [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
	 *
	 * or
	 * [x1, y1, x2, y2, ... xn, yn]
	 *
	 * @param {Array} points - array with point objects or pairs
	 * @returns {Array} A new array with transformed points
	 */
	applyToArray(points);
	/**
	 * Apply current matrix to a typed array with point pairs. Although
	 * the input array may be an ordinary array, this method is intended
	 * for more performant use where typed arrays are used. The returned
	 * array is regardless always returned as a Float32Array.
	 *
	 * @param {*} points - (typed) array with point pairs
	 * @returns {Float32Array} A new array with transformed points
	 */
	applyToTypedArray(points);
	/**
	 * Apply to any canvas 2D context object. This does not affect the
	 * context that optionally was referenced in constructor unless it is
	 * the same context.
	 * @param {CanvasRenderingContext2D} context
	 */
	applyToContext(context);
	/**
	 * Returns true if matrix is an identity matrix (no transforms applied).
	 * @returns {boolean} True if identity (not transformed)
	 */
	isIdentity();
	/**
	 * Compares current matrix with another matrix. Returns true if equal
	 * (within epsilon tolerance).
	 * @param {Matrix} m - matrix to compare this matrix with
	 * @returns {boolean}
	 */
	isEqual(m);
}