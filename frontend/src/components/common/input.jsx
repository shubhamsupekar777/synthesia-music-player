import React, { useState } from "react";
import "../../css/auth/Input.css";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";

const Input = ({ value, onChange, label, placeholder, type }) => {
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="input-wrapper">
      <label>{label}</label>
      <div className="input-container">
        <input
          type={
            type === "password" ? (showPassword ? "text" : "password") : type
          }
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e)}
          className="input-field"
        />
        {type === "password" && (
          <>
            <button type="button" className="input-eye-btn">
              {showPassword ? (
                <FaRegEye size={22} onClick={() => toggleShowPassword()} />
              ) : (
                <FaRegEyeSlash size={22} onClick={() => toggleShowPassword()} />
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Input;
