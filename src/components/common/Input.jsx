import React from 'react';
import PropTypes from 'prop-types';

const Input = ({
  type = 'text',
  placeholder = '',
  value = '',
  onChange,
  className = '',
  disabled = false,
  required = false,
  as = 'input',
  id,
  ...props
}) => {
  const Component = as;

  return (
    <Component
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`form-input ${className}`}
      id={id}
      {...props}
    />
  );
};

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  as: PropTypes.string,
  id: PropTypes.string,
};

Input.defaultProps = {
  type: 'text',
  placeholder: '',
  value: '',
  className: '',
  disabled: false,
  required: false,
  as: 'input',
  id: undefined,
};

export default Input;
