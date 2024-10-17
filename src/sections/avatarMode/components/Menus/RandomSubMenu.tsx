import React, { useState, useEffect } from "react";

interface RandomSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

interface RandomSubMenuProps {
  handleSendCommands: (command: Record<string, string>) => Promise<boolean>;
}

const RandomSubMenu: React.FC<RandomSubMenuProps> = ({
  handleSendCommands,
}) => {
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(
    "traits_filter"
  );
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState<Record<string, boolean>>({
    Male: true,
    Female: true,
  });
  const [ethnicities, setEthnicities] = useState<Record<string, boolean>>({
    "East Asian": false,
    "Latino/ Hispanic": false,
    "South Asian/ Indian": false,
    "Middle Eastern": false,
    "European/ Caucasian": false,
    "Indigenous/ Native American": false,
    "African/ Caribbean": false,
  });
  const [groomingOptions, setGroomingOptions] = useState<
    Record<string, boolean>
  >({
    Hairshort: true,
    Tattoo: true,
    Hairmedium: true,
    Beard: true,
    Hairlong: true,
    Mustache: true,
    Haircolor: true,
    Eyescolor: true,
    Scene: false,
    Look: false,
  });

  const toggleSubmenu = (submenu: string) => {
    setActiveSubmenu(activeSubmenu === submenu ? null : submenu);
  };

  const updateSliderValue = (value: number) => {
    setAge(value);
    handleSendCommands({ age: value.toString() });
  };

  const handleCheckboxChange = async (
    category: string,
    name: string,
    checked: boolean
  ) => {
    let newState;
    switch (category) {
      case "gender":
        newState = { ...gender, [name]: checked };
        setGender(newState);
        break;
      case "ethnicity":
        newState = { ...ethnicities, [name]: checked };
        setEthnicities(newState);
        break;
      case "grooming":
        newState = { ...groomingOptions, [name]: checked };
        setGroomingOptions(newState);
        break;
    }

    if (name === "Beard" || name === "Mustache") {
      await handleSendCommands({ assetname: checked ? name : `00_NO_${name}` });
    } else {
      await handleSendCommands({
        [name.toLowerCase()]: checked ? "Yes" : "No",
      });
    }
  };

  return (
    <ul id="randomSubMenu" className="sub-menu">
      <li>
        <button
          className={`transparent-button ${
            activeSubmenu === "traits_filter" ? "selected" : ""
          }`}
          onClick={() => toggleSubmenu("traits_filter")}
        >
          Traits Filter
        </button>
        {activeSubmenu === "traits_filter" && (
          <div
            className="content-container"
            style={{ backgroundColor: "transparent" }}
          >
            <form id="randomizeForm" onSubmit={(e) => e.preventDefault()}>
              <div className="checkbox_item citem_1">
                <div className="randomize-container">
                  <div className="checkbox_item citem_1">
                    <div className="slider-container">
                      <div className="slider-label-container">
                        <span
                          className="slider-label"
                          style={{ color: "white", marginLeft: "10px" }}
                        >
                          Age
                        </span>
                        <span
                          className="slider-value"
                          style={{ color: "white" }}
                        >
                          {age}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={25}
                        max={60}
                        step={1}
                        value={age}
                        id="mySlider"
                        className="slider"
                        onChange={(e) =>
                          updateSliderValue(parseInt(e.target.value))
                        }
                      />
                    </div>

                    {Object.entries(gender).map(([genderType, isChecked]) => (
                      <div key={genderType} className="check_container">
                        <div className="checkbox-label">{genderType}</div>
                        <label className="checkbox_wrap">
                          <input
                            type="checkbox"
                            name={genderType}
                            className="checkbox_inp"
                            checked={isChecked}
                            onChange={(e) =>
                              handleCheckboxChange(
                                "gender",
                                genderType,
                                e.target.checked
                              )
                            }
                          />
                          <span className="checkbox_mark"></span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="title" style={{ marginTop: "20px" }}>
                  Ethnicity
                </div>
                <div className="randomize-container">
                  {Object.entries(ethnicities).map(([ethnicity, isChecked]) => (
                    <div key={ethnicity} className="check_container">
                      <div className="checkbox-label">{ethnicity}</div>
                      <label className="checkbox_wrap">
                        <input
                          type="checkbox"
                          name={ethnicity}
                          className="checkbox_inp"
                          checked={isChecked}
                          onChange={(e) =>
                            handleCheckboxChange(
                              "ethnicity",
                              ethnicity,
                              e.target.checked
                            )
                          }
                        />
                        <span className="checkbox_mark"></span>
                      </label>
                    </div>
                  ))}
                </div>

                <div className="title" style={{ marginTop: "20px" }}>
                  Groom
                </div>
                <div className="randomize-container">
                  <div className="checkbox_item citem_1">
                    {Object.entries(groomingOptions).map(
                      ([option, isChecked]) => (
                        <div key={option} className="check_container">
                          <div className="checkbox-label">
                            {option.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                          <label className="checkbox_wrap">
                            <input
                              type="checkbox"
                              name={option}
                              className="checkbox_inp"
                              checked={isChecked}
                              onChange={(e) =>
                                handleCheckboxChange(
                                  "grooming",
                                  option,
                                  e.target.checked
                                )
                              }
                            />
                            <span className="checkbox_mark"></span>
                          </label>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        )}
      </li>
    </ul>
  );
};

export default RandomSubMenu;
