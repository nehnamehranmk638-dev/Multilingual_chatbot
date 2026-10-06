import React, { useState } from 'react';
import { X } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

// Reasons shown when a user marks a response as "Not Helpful"
const NOT_HELPFUL_REASONS = [
  {
    value: 'incorrect_information',
    label: 'Incorrect information',
  },
  {
    value: 'incomplete_answer',
    label: 'Incomplete answer',
  },
  {
    value: 'outdated_information',
    label: 'Outdated information',
  },
  {
    value: 'unclear_answer',
    label: 'Answer was unclear',
  },
  {
    value: 'misunderstood_question',
    label: "Didn't understand my question",
  },
  {
    value: 'wrong_translation',
    label: 'Wrong translation/language',
  },
  {
    value: 'other',
    label: 'Other',
  },
];

/**
 * FeedbackDialog
 *
 * type:
 *   'response_helpful'
 *   'response_not_helpful'
 *   'general'
 *
 * sessionId:
 *   Current chatbot session ID.
 *
 * messageId:
 *   MongoDB _id of the bot message.
 *   Required for response feedback.
 *   null for general feedback.
 *
 * language:
 *   Current conversation language.
 *
 * userMode:
 *   'student' or 'parent'
 *
 *   This is NOT shown to the user.
 *   It is automatically attached to the feedback.
 *
 * onClose:
 *   Closes the dialog.
 *
 * onSubmit:
 *   Called after feedback is successfully stored.
 */

export default function FeedbackDialog({
  type,
  sessionId,
  messageId,
  language = 'en',
  userMode = '',
  onClose,
  onSubmit,
}) {
  // =========================================================
  // Shared state
  // =========================================================

  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // =========================================================
  // Response feedback state
  // =========================================================

  const [selectedReason, setSelectedReason] =
    useState('');

  // =========================================================
  // General feedback state
  // =========================================================

  const [starRating, setStarRating] =
    useState(0);

  const [hoveredStar, setHoveredStar] =
    useState(0);

  const [name, setName] =
    useState('');

  const [email, setEmail] =
    useState('');


  // =========================================================
  // Determine feedback type
  // =========================================================

  const isResponseFeedback =
    type === 'response_helpful' ||
    type === 'response_not_helpful';


  // =========================================================
  // Determine rating
  // =========================================================

  const responseRating =
    type === 'response_helpful'
      ? 'helpful'
      : type === 'response_not_helpful'
      ? 'not_helpful'
      : null;


  // =========================================================
  // Validation
  // =========================================================

  const validate = () => {

    // General feedback requires a star rating
    if (type === 'general') {

      if (!starRating) {
        return 'Please select a star rating.';
      }

      // Email is optional.
      // Validate only if the user entered one.
      if (email.trim()) {

        const emailPattern =
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email.trim())) {
          return 'Please enter a valid email address.';
        }
      }
    }


    // Response feedback must have a message ID
    if (isResponseFeedback && !messageId) {
      return 'This response could not be identified. Please try again.';
    }

    return '';
  };


  // =========================================================
  // Submit feedback
  // =========================================================

  const handleSubmit = async () => {

    // Clear previous error
    setError('');


    // Validate form
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }


    setSubmitting(true);


    try {

      let payload;


      // =====================================================
      // RESPONSE FEEDBACK
      // =====================================================

      if (isResponseFeedback) {

        payload = {
          feedback_type: 'response',

          session_id:
            sessionId || '',

          message_id:
            messageId,

          rating:
            responseRating,

          reason:
            type === 'response_not_helpful'
              ? selectedReason
              : '',

          comment:
            comment
              .trim()
              .slice(0, 2000),

          language:
            language || 'en',

          /*
           * Student / Parent mode is automatically
           * attached.
           *
           * It is NOT shown as a form field.
           */
          user_mode:
            userMode || '',
        };

      }


      // =====================================================
      // GENERAL APP FEEDBACK
      // =====================================================

      else {

        payload = {
          feedback_type: 'general',

          session_id:
            sessionId || '',

          /*
           * General feedback uses a 1–5 star rating.
           */
          rating:
            starRating,

          comment:
            comment
              .trim()
              .slice(0, 2000),

          /*
           * Optional
           */
          name:
            name
              .trim()
              .slice(0, 200),

          /*
           * Optional
           */
          email:
            email
              .trim()
              .slice(0, 200),

          language:
            language || 'en',

          /*
           * Automatically captured from the
           * selected Parent / Student mode.
           *
           * Not displayed to the user.
           */
          user_mode:
            userMode || '',
        };
      }


      // =====================================================
      // Send to Django
      // =====================================================

      const response = await fetch(
        `${API_BASE_URL}/feedback/`,
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body:
            JSON.stringify(payload),
        }
      );


      // =====================================================
      // Handle backend errors
      // =====================================================

      if (!response.ok) {

        const errorData =
          await response
            .json()
            .catch(() => ({}));

        throw new Error(
          errorData.error ||
          `Server error ${response.status}`
        );
      }


      // =====================================================
      // Success
      // =====================================================

      if (onSubmit) {
        onSubmit(payload);
      }


    } catch (err) {

      console.error(
        'Feedback submission error:',
        err
      );

      setError(
        err.message ||
        'Failed to submit feedback. Please try again.'
      );

    } finally {

      setSubmitting(false);
    }
  };


  // =========================================================
  // Render
  // =========================================================

  return (
    <div
      className="feedback-overlay"
      onClick={(e) => {

        /*
         * Close only when clicking the
         * background overlay.
         */
        if (
          e.target === e.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div
        className="feedback-dialog"
        role="dialog"
        aria-modal="true"
      >

        {/* ===================================================
            HEADER
            =================================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >

          <h3>

            {type === 'response_helpful' &&
              '👍 Thanks! Any comments?'}

            {type === 'response_not_helpful' &&
              '👎 What went wrong?'}

            {type === 'general' &&
              'Give Feedback'}

          </h3>


          <button
            onClick={onClose}
            className="btn-icon"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              flexShrink: 0,
            }}
            aria-label="Close"
            type="button"
          >
            <X size={14} />
          </button>

        </div>


        {/* ===================================================
            NOT HELPFUL REASONS
            =================================================== */}

        {type === 'response_not_helpful' && (

          <div className="feedback-field">

            <label>
              What was the issue? (optional)
            </label>


            <div className="feedback-reasons">

              {NOT_HELPFUL_REASONS.map(
                (reason) => (

                  <button
                    key={reason.value}
                    className={
                      `reason-chip ${
                        selectedReason ===
                        reason.value
                          ? 'selected'
                          : ''
                      }`
                    }
                    onClick={() =>
                      setSelectedReason(
                        selectedReason ===
                        reason.value
                          ? ''
                          : reason.value
                      )
                    }
                    type="button"
                  >
                    {reason.label}
                  </button>

                )
              )}

            </div>

          </div>

        )}


        {/* ===================================================
            STAR RATING
            =================================================== */}

        {type === 'general' && (

          <div className="feedback-field">

            <label>
              How would you rate the chatbot? *
            </label>


            <div className="star-rating">

              {[1, 2, 3, 4, 5].map(
                (star) => (

                  <button
                    key={star}
                    type="button"
                    className={
                      `star-btn ${
                        star <=
                        (
                          hoveredStar ||
                          starRating
                        )
                          ? 'active'
                          : ''
                      }`
                    }
                    onClick={() =>
                      setStarRating(star)
                    }
                    onMouseEnter={() =>
                      setHoveredStar(star)
                    }
                    onMouseLeave={() =>
                      setHoveredStar(0)
                    }
                    aria-label={
                      `${star} star${
                        star > 1
                          ? 's'
                          : ''
                      }`
                    }
                  >
                    ★
                  </button>

                )
              )}

            </div>

          </div>

        )}


        {/* ===================================================
            COMMENT / SUGGESTION
            =================================================== */}

        <div className="feedback-field">

          <label>

            {type === 'general'
              ? 'Your feedback or suggestion'
              : 'Tell us more (optional)'}

          </label>


          <textarea
            className="feedback-textarea"
            placeholder={
              type === 'general'
                ? 'Share suggestions, complaints, or general thoughts...'
                : 'Add a comment (optional)...'
            }
            value={comment}
            onChange={(e) =>
              setComment(e.target.value)
            }
            maxLength={2000}
            rows={4}
          />


          <small
            style={{
              display: 'block',
              textAlign: 'right',
              opacity: 0.55,
              fontSize: '0.7rem',
              marginTop: 4,
            }}
          >
            {comment.length}/2000
          </small>

        </div>


        {/* ===================================================
            OPTIONAL NAME
            =================================================== */}

        {type === 'general' && (

          <div className="feedback-field">

            <label>
              Name (optional)
            </label>


            <input
              className="feedback-input"
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              maxLength={200}
            />

          </div>

        )}


        {/* ===================================================
            OPTIONAL EMAIL
            =================================================== */}

        {type === 'general' && (

          <div className="feedback-field">

            <label>
              Email (optional)
            </label>


            <input
              className="feedback-input"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              maxLength={200}
            />

          </div>

        )}


        {/* ===================================================
            ERROR
            =================================================== */}

        {error && (

          <p
            style={{
              color: '#f87171',
              fontSize: '0.8rem',
              margin: 0,
            }}
          >
            ⚠️ {error}
          </p>

        )}


        {/* ===================================================
            ACTION BUTTONS
            =================================================== */}

        <div className="feedback-actions">

          <button
            className="btn-feedback-cancel"
            onClick={onClose}
            type="button"
            disabled={submitting}
          >
            Cancel
          </button>


          <button
            className="btn-feedback-submit"
            onClick={handleSubmit}
            disabled={submitting}
            type="button"
          >
            {submitting
              ? 'Submitting…'
              : type === 'general'
              ? 'Submit Feedback'
              : 'Submit'}
          </button>

        </div>

      </div>

    </div>
  );
}