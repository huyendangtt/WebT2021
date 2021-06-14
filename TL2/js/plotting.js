let countryDaten;
let countryList;
let numberOfDisplayRecords = 8;
//let corsProxyUrl = "https://cors-anywhere.herokuapp.com/";
let vaccinationAPI = "https://l1n.de/tl2/public/country/[code]/vaccinations";

function countrySelectedChange(code) {
    // get latest statistics
    let selectedCountryData = countryDaten.find(e => e.value.code === code);
    let latestRecords;
    if (selectedCountryData.value.vaccination_data.length > numberOfDisplayRecords) {
        latestRecords = selectedCountryData.value.vaccination_data.slice(-numberOfDisplayRecords);
    } else {
        latestRecords = selectedCountryData.value.vaccination_data;
    }

    // populate table information
    for (let i = 1; i <= numberOfDisplayRecords; i++) {        
        if (i-1 <= latestRecords.length) {
            // if within of array index bound, then populating the date
            let recordDate = new Date(latestRecords[i-1].date);
            document.querySelector("#table thead th:nth-child(" + (i+1) + ")").innerText = recordDate.getDate() + "-" + (recordDate.getMonth() +1);
            // next, populate the value table
            document.querySelector("#table tbody td:nth-child(" + (i+1) + ")").innerText = latestRecords[i-1].total_vaccinations;
        // populate the value
        } else {
            // array index out of bound, then inserting N/A value
            document.querySelector("#table thead th:nth-child(" + (i+1) + ")").innerText = "N/A";
            document.querySelector("#table tbody td:nth-child(" + (i+1) + ")").innerText = "N/A";
        }
    }

    // TODO: build bar chart based on the latestRecords array. Used the debug tools of Chrome/Edge/Firefox
    // to investigate the data format and use the proper values.
}

function getCountryCoronaData(url, code, name) {
    return fetch(url)
            .then((resp) => resp.json())
            .then(data => {
                // console.log(data);
                return {
                    "code": code,
                    "name": name,
                    "vaccination_data": data
                };
            })
            .catch(error => console.warn(error));
}

async function getCoronaData(url) {
    let response = await fetch(url);
    countryList = await response.json();

    console.log(countryList);
    let promises = [];
    for (elem of countryList) {
        //let apiUrl = corsProxyUrl + vaccinationAPI.replace("[code]", elem.code);
        let apiUrl = vaccinationAPI.replace("[code]", elem.code);
        promises.push(getCountryCoronaData(apiUrl, elem.code, elem.country));
    }

    Promise.allSettled(promises).then((resp) => {        
        console.log(resp);
        countryDaten = resp.filter(function(e) {
            return e.value;
        });

        let firstLoadingGif = document.querySelector("#loading1");
        firstLoadingGif.parentNode.removeChild(firstLoadingGif);

        let zeitlicheEntwicklungHolder = document.querySelector("#entwicklung");

        // add necessary elements:
        // h1
        let zeitlicheEntwicklungHeader = document.createElement("h1");
        zeitlicheEntwicklungHeader.id = 'zeitliche_entwicklung';
        zeitlicheEntwicklungHeader.classList.add("pt-md-50", "pt-lg-50", "pt-xl-50");
        zeitlicheEntwicklungHeader.innerText = 'Zeitliche Entwicklung';

        // label
        let zeitlicheEntwicklungLabel = document.createElement("label");
        zeitlicheEntwicklungLabel.id = 'labelZeitlicheEntwicklung';
        zeitlicheEntwicklungLabel.setAttribute("for", "countries");
        zeitlicheEntwicklungLabel.innerText = 'Bitte wählen Sie eines der folgenden Länder aus:';

        // select box:
        let zeitlicheEntwicklungSelectionBox = document.createElement("select");
        zeitlicheEntwicklungSelectionBox.setAttribute("name", "countries");
        zeitlicheEntwicklungSelectionBox.id = "countries";
        zeitlicheEntwicklungSelectionBox.classList.add("mdb-select", "md-form");

        // add empty option
        let emptyOption = document.createElement("option");
        emptyOption.value = "none";
        emptyOption.disabled = true;
        emptyOption.selected = true;
        emptyOption.innerHTML = "Select One...";
        zeitlicheEntwicklungSelectionBox.appendChild(emptyOption);

        // add options to select box
        for (elem of resp) {
            if (typeof elem.value !== "undefined") {
                let opt = document.createElement("option");
                opt.value = elem.value.code;
                opt.innerHTML = elem.value.name;
                zeitlicheEntwicklungSelectionBox.appendChild(opt);
            }
        }

        // handle select event
        zeitlicheEntwicklungSelectionBox.addEventListener("change", function() {
            countrySelectedChange(zeitlicheEntwicklungSelectionBox.value);
        });

        zeitlicheEntwicklungHolder.appendChild(zeitlicheEntwicklungHeader);
        zeitlicheEntwicklungHolder.appendChild(zeitlicheEntwicklungLabel);
        zeitlicheEntwicklungHolder.appendChild(zeitlicheEntwicklungSelectionBox);
    });
}

getCoronaData("/data/countries.json");