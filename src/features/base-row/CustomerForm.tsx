import React, { FormEvent, useState } from "react";

type FormFields = {
  fullName: string;
  email: string;
  message: string;
};

type FormErrors = {
  fullName?: string;
  email?: string;
  message?: string;
};

const CustomerForm = () => {
  const [fields, setFields] = useState<FormFields>({
    fullName: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFields({
      ...fields,
      [name]: value,
    });
  };

  const validate = (): boolean => {
    let isValid = true;
    let errors: FormErrors = {};

    // Full Name Validation
    if (!fields.fullName) {
      errors.fullName = "Full Name is required";
      isValid = false;
    }

    // Email Validation
    if (!fields.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(fields.email)) {
      errors.email = "Email is invalid";
      isValid = false;
    }

    // Message Validation
    if (!fields.message) {
      errors.message = "Message is required";
      isValid = false;
    }

    setErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form is valid. Submitting...");
      // Submit logic here
    }
  };

  return (
    <form>
      <div>
        <label for="fullName">Full Name:</label>
        <input
          type="text"
          id="fullName"
          name="fullName"
          value={fields.fullName}
          // onChange={handleInputChange}
        />
        {errors.fullName && <p>{errors.fullName}</p>}
      </div>

      <div>
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={fields.email}
          // onChange={handleInputChange}
        />
        {errors.email && <p>{errors.email}</p>}
      </div>

      <div>
        <label for="message">Message:</label>
        <textarea
          id="message"
          name="message"
          value={fields.message}
          // onChange={handleInputChange}
        />
        {errors.message && <p>{errors.message}</p>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
};

export default CustomerForm;
