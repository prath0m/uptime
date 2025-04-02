const whois = require('whois');

async function checkDomainNameExpiry(url) {
    const domain = url.replace(/(https?:\/\/)?(www\.)?/, '').split('/')[0]; // Extract domain

    return new Promise((resolve, reject) => {
        whois.lookup(domain, (err, data) => {
            if (err) {
                console.error("Error fetching WHOIS data:", err);
                reject(new Error("Error checking domain name"));
                return;
            }
            const expiryMatch = data.match(/Expiry Date:\s*(.+)/i) || data.match(/Registrar Registration Expiration Date:\s*(.+)/i);
            
            if (expiryMatch) {
                resolve(new Date(expiryMatch[1].trim())); // Return expiry date
            } 
            else {
                reject(new Error("Could not determine the expiration date for " + domain));
            }
        });
    });
}

module.exports = checkDomainNameExpiry;