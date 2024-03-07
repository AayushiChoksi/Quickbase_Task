import React, { useState, useEffect } from 'react';
import { saveField } from './MockFieldService'; 
import './style.css';

function ChoiceBuilder() {
    const [label, setLabel] = useState('');
    const [defaultVal, setDefaultVal] = useState('');
    const [choicesText, setChoicesText] = useState('');
    const [order, setOrder] = useState('Alphabetical');
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [previewChoices, setPreviewChoices] = useState([]);
    const [progress, setProgress] = useState(0);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        // Retrieve form data from localStorage on component mount
        const savedFormData = localStorage.getItem('choiceBuilderFormData');
        if (savedFormData) {
            const { label, defaultVal, choicesText, order } = JSON.parse(savedFormData);
            setLabel(label);
            setDefaultVal(defaultVal);
            setChoicesText(choicesText);
            setOrder(order || 'Alphabetical');

            // Display a message or prompt
            alert('Your responses have been automatically saved.');
        } else {
            // Initialize state variables to default values if no saved data
            setLabel('');
            setDefaultVal('');
            setChoicesText('');
            setOrder('Alphabetical');
        }
    }, []);

    useEffect(() => {
        // Update preview choices whenever choicesText changes
        const choices = choicesText.split('\n').filter(choice => choice.trim() !== '');
        setPreviewChoices(choices);

        // Calculate progress
        const totalFields = 4; // Total number of form fields (label, defaultVal, choices, order)
        let completedFields = 0;
        if (label.trim() !== '') completedFields++;
        if (defaultVal.trim() !== '') completedFields++;
        if (choicesText.trim() !== '') completedFields++;
        if (order.trim() !== '') completedFields++;

        const calculatedProgress = (completedFields / totalFields) * 100;
        setProgress(calculatedProgress);
    }, [label, defaultVal, choicesText, order]);

    const handleChoicesChange = (e) => {
        const text = e.target.value;
        setChoicesText(text);

        if (text.length > 40) {
            e.target.classList.add("long-text");
        } else {
            e.target.classList.remove("long-text");
        }

        // Store form data in localStorage whenever it changes
        const formData = { label, defaultVal, choicesText: text, order };
        localStorage.setItem('choiceBuilderFormData', JSON.stringify(formData));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        // Validate label
        const validationErrors = {};
        if (label.trim() === '') {
            validationErrors['label'] = 'Label field is required.';
        }

        // Validate duplicates
        const choices = choicesText.split('\n').filter(choice => choice.trim() !== '');
        if (choices.length === 0) {
            validationErrors['choices'] = 'At least one choice is required.';
        }
        const uniqueChoices = new Set(choices);
        if (choices.length !== uniqueChoices.size) {
            validationErrors['choices'] = 'Duplicate choices are not allowed.';
        }

        // Validate total number of choices
        if (choices.length > 50) {
            validationErrors['choices'] = 'Cannot have more than 50 choices total.';
        }

        // Clear previous errors
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
            setIsLoading(false);
            return;
        }

        // Sort choices based on the selected order
        let sortedChoices = [...choices];
        if (order === 'Alphabetical') {
            sortedChoices.sort();
        } else if (order === 'Descending_Alphabetical') {
            sortedChoices.sort().reverse();
        }

        // If the default value is not in choices, add it
        const trimmedDefaultVal = defaultVal.trim();
        if (!sortedChoices.includes(trimmedDefaultVal) && trimmedDefaultVal !== '') {
            sortedChoices.unshift(trimmedDefaultVal);
            setChoicesText(prevChoicesText => `${trimmedDefaultVal}\n${prevChoicesText}`);
        }

        // Create JSON object
        const fieldJson = {
          label,
          defaultVal,
          choices: sortedChoices,
          order,
          required: false,
          displayAlpha: true
        };
    
        try {
          await new Promise(resolve => setTimeout(resolve, 1000));
          await saveField(fieldJson); 
          alert('Field data saved successfully!');
          // Add actions to clear the form, if desired
        } catch (error) {
          console.error('Error saving field:', error);
          // Handle errors appropriately, display messages to the user 
        } finally {
          setIsLoading(false);
        }
      }

    const handleClearForm = () => {
        localStorage.removeItem('choiceBuilderFormData');
        setLabel('');
        setDefaultVal('');
        setChoicesText('');
        setOrder('');
        setErrors({});
        setSuccessMessage('');
    };

  return (
    <div className="choice-builder-container">
      <div className="form-container">
        <h2>Field Builder</h2>
        <form id="field-builder" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="label">Label</label>
            <input type="text" id="label" name="label" value={label} onChange={e => setLabel(e.target.value)} />
            {errors.label && <div className="error-message">{errors.label}</div>}
          </div>
          <div className="form-group-type">
            <label htmlFor="type">Type</label>
          </div>
          <div className="multipleSelect">
            <div className="multipleSelectValue">Multi-select</div>
            <input type="checkbox" id="requiredCheckbox" />
            <label htmlFor="requiredCheckbox">A Value is required</label>
          </div>
          <div className="form-group">
            <label htmlFor="default">Default Value</label>
            <input type="text" id="default" name="default" value={defaultVal} onChange={e => setDefaultVal(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="choices">Choices</label>
            <div className="choices-textarea-container">
              <div className="choices-textarea">
                <textarea
                  id="choices"
                  name="choices"
                  value={choicesText}
                  onChange={handleChoicesChange}
                  placeholder="Enter choices (one per line)"
                  rows={5}
                />
                {choicesText.length > 40 && (
                  <span className="character-limit-exceeded" style={{ color: 'red' }}>Character limit exceeded!</span>
                )}

              </div>
              {errors.choices && <div className="error-message">{errors.choices}</div>}
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="order">Order</label>
            <select name="opt" value={order} onChange={e => setOrder(e.target.value)}>
              <option value="Alphabetical">Display choices in Alphabetical</option>
              <option value="Descending_Alphabetical">Display choices in Descending Alphabetical</option>
              <option value="Choice3">User-defined order</option>
            </select>
          </div>
          <div className="button">
            {/* Use the isLoading state to toggle the button's loading state */}
            <button type="submit" id="submit-btn" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save changes'}</button>
            <b>Or</b>
            <b><span id="cancel-link" onClick={handleClearForm}>Cancel</span></b>
            {successMessage && <div className="success-message">{successMessage}</div>}
          </div>
        </form>
      </div>
      {/* Progress indicator */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
      {/* Live preview section */}
      <div className="live-preview">
        <h3>Live Preview</h3>
        <div>
          <strong>Label:</strong> {label}
        </div>
        <div>
          <strong>Choices:</strong>
          <select>
            {previewChoices.map((choice, index) => (
              <option key={index}>{choice}</option>
            ))}
          </select>
        </div>
        <div>
          <strong>Default Value:</strong> {defaultVal}
        </div>
        <div>
          <strong>Order:</strong> {order === 'Choice3' ? 'User-defined order' : `Display choices in ${order}`}
        </div>
      </div>
    </div>
  );
}

export default ChoiceBuilder;