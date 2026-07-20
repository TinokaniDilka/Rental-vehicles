const AuditLog = require("../models/AuditLog");

/**
 * Writes one entry to the Staff Action Audit Log.
 *
 * This never throws — a logging failure should never break the actual
 * operation (approving a booking, deleting a vehicle, etc). Any error is
 * caught and printed to the server console instead.
 *
 * @param {Object} params
 * @param {Object} params.actor        - The logged-in user performing the action (req.user)
 * @param {String} params.action       - Human-readable action label, must match AuditLog's enum
 * @param {String} [params.bookingId]  - Related booking, if any
 * @param {String} [params.targetType] - What kind of thing was acted on ("User", "Vehicle", "Promo", "Feedback")
 * @param {String} [params.targetId]   - The _id of that thing
 * @param {String} [params.details]    - Optional short human-readable extra context
 */
const logAudit = async ({ actor, action, bookingId, targetType, targetId, details }) => {
  try {
    if (!actor) return;

    await AuditLog.create({
      staffId: actor._id || actor.id,
      staffName: actor.name || "Unknown Staff",
      action,
      bookingId: bookingId || undefined,
      targetType: targetType || undefined,
      targetId: targetId || undefined,
      details: details || undefined
    });
  } catch (err) {
    console.error("Audit log write failed:", err.message);
  }
};

module.exports = { logAudit };
