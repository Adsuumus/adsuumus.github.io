import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { baseWay } from "./utils/maya";
import { minify, deminify } from "./utils/minify";
import { useNavigate, NavLink } from "react-router-dom";
import icon from "./assets/maya.webp";

export function Maya() {
  const navigate = useNavigate();
  const [activeFormat, setActiveFormat] = useState("tj");
  const savedDirtyData = useRef("");

  const editableRef = useRef(null);

  const buttons = [
    { value: "tj", label: "Т—Ж" },
    { value: "bs", label: "БС" },
    { value: "amp", label: "АМП" },
    { value: "easy", label: "Выпуск" },
    { separator: true },
    { value: "min", label: "Минификатор" },
    { value: "demin", label: "Разминификатор" },
  ];

  useLayoutEffect(() => {
    const savedFormat = localStorage.getItem("activeFormat");

    if (savedFormat) {
      setActiveFormat(savedFormat);
    }

    editableRef.current.focus();
  }, []);

  useEffect(() => {
    updateTypograph();
  }, [activeFormat]);

  function handleFormatChange(value) {
    setActiveFormat(value);
    localStorage.setItem("activeFormat", value);

    editableRef.current.focus();
  }

  function handlePaste(event) {
    event.preventDefault();

    let clipboardData = "";

    if (activeFormat !== "min" && activeFormat !== "demin") {
      clipboardData = (event.clipboardData || window.clipboardData).getData(
        "text/html",
      );
    } else {
      clipboardData = (event.clipboardData || window.clipboardData).getData(
        "text/plain",
      );
    }

    if (!clipboardData) {
      clipboardData = (event.clipboardData || window.clipboardData).getData(
        "text/plain",
      );
    }

    if (clipboardData) {
      savedDirtyData.current = clipboardData;
      updateTypograph();
    }
  }

  function updateTypograph() {
    const clipboardData = savedDirtyData.current;

    if (!clipboardData || !editableRef.current) {
      return;
    }

    if (activeFormat === "min" || activeFormat === "demin") {
      editableRef.current.textContent = main(clipboardData);
    } else {
      editableRef.current.innerHTML = main(clipboardData);
    }
  }

  function main(html) {
    if (activeFormat === "min") {
      html = minify(html);
    } else if (activeFormat === "demin") {
      html = deminify(html);
    } else {
      html = baseWay(html, activeFormat);
    }

    return html;
  }

  return (
    <>
      <div className="header">
        <NavLink to={{ pathname: "/", search: "?cropper" }}>
          <img src={icon} alt="" className="icon" />
        </NavLink>

        <div className="buttons-container">
          {buttons.map((item, index) =>
            item.separator ? (
              <div key={index} className="button-container-separator" />
            ) : (
              <button
                key={item.value}
                className={`button radio-button ${
                  activeFormat === item.value ? "active" : ""
                }`}
                data-value={item.value}
                onClick={() => handleFormatChange(item.value)}
              >
                {item.label}
              </button>
            ),
          )}
        </div>
        <button
          className="button crp-button"
          onClick={() => {
            navigate("/?cropper");
          }}
        >
          Кроппер →
        </button>
      </div>

      <div
        ref={editableRef}
        id="typograph-container"
        contentEditable="true"
        spellCheck="false"
        autoCorrect="off"
        className="text-container"
        onPaste={handlePaste}
      />
    </>
  );
}
