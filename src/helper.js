import { message } from 'antd';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';

const indexToMonthMap = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec"
}

export const numToAlphaMap = {
    1: "A",
    2: "B",
    3: "C",
    4: "D",
    5: "E",
    6: "F",
    7: "G",
    8: "H",
    9: "I",
    10: "J",
    11: "K",
    12: "L",
    13: "M",
    14: "N",
    15: "O",
    16: "P",
    17: "Q",
    18: "R",
    19: "S",
    20: "T",
    21: "U",
    22: "V",
    23: "W",
    24: "X",
    25: "Y",
    26: "Z"
}

export function getCustomerModifiedNumber(customerNumber) {
    return String(customerNumber).substring(1, 5);
  }
  
  export function getCustomerModifiedName(customerName) {
    return String(customerName).substring(1, 10);
  }

export const deleteCookies = () => {
    var allCookies = document.cookie.split(';');
    
    // The "expire" attribute of every cookie is 
    // Set to "Thu, 01 Jan 1970 00:00:00 GMT"
    for (var i = 0; i < allCookies.length; i++)
        document.cookie = allCookies[i] + "=;expires="
        + new Date(0).toUTCString();
}


// local helper function
const createDateString = (dateFormatItemList, delimiter = "/", day, month, year) => {
    let outputString = "";

    dateFormatItemList.forEach(item => {
        if (item === "dd") {
            day = (Math.trunc(day / 10) === 0) ? "0" + `${day}` : day.toString();
            outputString += day
            outputString += delimiter
        }
        else if (item === "mm") {
            month = (Math.trunc(month / 10) === 0) ? "0" + `${month}` : month.toString();
            outputString += month
            outputString += delimiter
        }
        else if (item === "mmm") {
            month = indexToMonthMap[month]
            outputString += month
            outputString += delimiter
        }
        else if (item === "yyyy") {
            outputString += year.toString()
            outputString += delimiter
        }
        else if (item === "yy") {
            year = year.toString()
            year = year.slice(year.length - 2)
            outputString += year
            outputString += delimiter
        }
    })

    outputString = outputString.slice(0, outputString.length - 1)
    return outputString
}

/**
 * It takes a date object, a date format string,
 * and converts the date object to the date string in the format specified.
 * @Date [date] - The date object to be converted to a string.
 * @string [date_format=dd/mm/yyyy] - The format of the date you want to convert to. 
 * Please note that the date format should contain either - or / as a delimeter.
 * @returns a string which is a date in the specified format.
 */
export const convertToDateString = (
    date = new Date,
    dateFormat = "dd/mm/yyyy"
) => {
    const day = date.getDate(), month = date.getMonth() + 1, year = date.getFullYear();
    let outputString = "",
        acceptedDateFormatSymbols = ["dd", "mm", "mmm", "yyyy", "yy"]

    dateFormat = dateFormat.toLowerCase()

    if (dateFormat.includes("-")) {
        const dateFormatItemList = dateFormat.split("-")
        outputString = createDateString(dateFormatItemList, "-", day, month, year)
    }
    else if (dateFormat.includes("/")) {
        const dateFormatItemList = dateFormat.split("/")
        outputString = createDateString(dateFormatItemList, "/", day, month, year)
    }
    else if (acceptedDateFormatSymbols.some(substr => substr === dateFormat)) {
        const dateFormatItemList = dateFormat.split()
        outputString = createDateString(dateFormatItemList, "#", day, month, year)
    }
    return outputString
}

export const isLinkActive = (path) => {
    return window.location.pathname == path ? true : false;
}

/**
 * It takes an array of objects, a key name, and an array of key values, and returns an array of
 * objects filtered on the basis of key name and key values provided.
 * 
 * @Array [object_array] - The array of objects you want to filter.
 * @String [key_name] - The name of the key you want to filter by.
 * @Array [key_values] - This is the list of values for the given key
 *  which needs to be filtered from the object_array.
 * @returns a list of objects filtered on the basis of give key_name and key_values.
 */
export const filterObjectsArray = (objectArray = [], keyName = "", keyValues = []) => {
    let filteredArray = [];
    for (let obj of objectArray) {
        if (Object.keys(obj).includes(keyName)) {
            const value = obj[keyName];
            if (keyValues.includes(value)) {
                filteredArray.push(obj);
            }
        }
    }
    return filteredArray;
}

/**
    Logic: 
    This function will return an object,
    which is a map having key as a tick label and value as distance of that tick from the origin.

    Input:
    It takes 2 arguments as input, one is axis_type (specifying x-axis or y-axis)
    and the other is labels array which specifies the label name for all ticks present in that axis.
**/
export function getTickDistancesMap(labels, axisType = "x") {
    const ticks = document.getElementsByClassName("tick");
    let output = {};
    for (let obj of ticks) {
        if (labels.includes(obj.__data__)) {
            output[obj.__data__] = obj.attributes.transform.textContent;
        }
    }
    Object.keys(output).forEach((key) => {
        if (axisType === "y") {
            output[key] = Number(
                output[key].replace("translate(0,", "").replace(")", "")
            );
        } else if (axisType === "x") {
            output[key] = Number(
                output[key].replace("translate(", "").replace(",0)", "")
            );
        }
    });
    return output;
}

export function convertNumber(valuearg) {
    let value = valuearg;
    if (value < 0) {
        //Handling the negative values
        value = value * -1;
    }
    if (value >= 1000000000) {
        value = value / 1000000000;
        value = value % 1 !== 0 ? value.toFixed(2) + "B" : value + "B";
    } else if (value >= 1000000) {
        value = value / 1000000;
        value = value % 1 !== 0 ? value.toFixed(2) + "M" : value + "M";
    } else if (value >= 1000) {
        value = value / 1000;
        value = value % 1 !== 0 ? value.toFixed(2) + "K" : value + "K";
    } else if (value < 1000) {
        value = value % 1 !== 0 ? value : value;
    }

    if (valuearg < 0) {
        //Handling the negative values
        value = "-" + value;
    }
    return value;
}


/**
 * It takes a string and returns the same string with the first letter capitalized.
 * @str [String] - The string to be capitalized.
 * @returns the same string with the first letter in uppercase.
 */
export const initCapitalForString = (str = "") => {
    if (str.length > 1)
      return str[0].toUpperCase() + str.slice(1)
    else if (str.length == 1) {
      return str[0].toUpperCase()
    }
    return str;
  }



/**
 * It takes an array of objects, converts it to a workbook, and then saves it as a file.
 * @Array [csvData] - The data you want to export.
 * @String [fileName] - The name of the file you want to download.
 * @String [fileType] - The type of file you want to export.
 * @String [fileExtension=.xlsx] - The extension of the file you want to download.
 */
export const exportToCSV = (csvData = [], fileName = "", fileType = "", fileExtension = '.xlsx') => {
    try {
        if (fileType === "") {
            fileType = "'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'";
        }
        const ws = XLSX.utils.json_to_sheet(csvData);
        const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], { type: fileType });
        FileSaver.saveAs(data, fileName + fileExtension);
    } catch (error) {
        console.log(error);
        message.error("Some problem occurred while downloading file.")
    }
}

/**
 * It takes a number and a precision, and returns the number with the precision applied.
 * @Number - The number to be rounded.
 * @Number [precision=2] - The number of decimal places to round to.
 * @returns the number with the precision set.
 */
export const setPrecision = (number, precision = 2) => {
    try {
        return Number(number.toFixed(precision))
    } catch (error) {
        console.log(error)
    }
}

/**
 * It checks if the given financial year is equal to the current financial year.
 * NOTE: Any finanical here is starting onwards from April till the March of next year.
 * @param [fy] - [2018, 2019]
 * @returns A function that takes a parameter fy and returns a boolean.
 */
export const isCurrentFinancialYear = (fy = []) => {
    // const currentMonth = new Date().getMonth() + 1, currentYear = new Date().getFullYear()
    const currentMonth = 3, currentYear = 2023


    if (currentMonth <= 3) {
        if (fy[0] == currentYear - 1) {
            return true
        }
    }

    if (fy[0] === currentYear) {
        return true
    }

    return false
}

export const getCurrentFinancialYear = () => {
    try {
        // const currentMonth = new Date().getMonth() + 1, currentYear = new Date().getFullYear()
        const currentMonth = 3, currentYear = 2023
        if (currentMonth <= 3) {
            return [currentYear - 1, currentYear]
        }

        return [currentYear, currentYear + 1]
    } catch (error) {
        console.log(error)
        return []
    }
}

/**
 * The function `getMonthName` takes a month number as input and returns the corresponding month name.
 * @param monthNumber - The `monthNumber` parameter is a number representing the month. It should be a
 * value between 1 and 12, where 1 represents January and 12 represents December.
 * @returns the name of the month corresponding to the given month number.
 */
export const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);

    return date.toLocaleString('en-US', { month: 'long' });
}