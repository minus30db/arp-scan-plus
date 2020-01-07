const fs = require('fs');
const cp = require('child_process');
const ouiLookup = require('oui');


// fs.createReadStream(__filename)
//     .pipe(process.stdout);

const iface = process.argv[2] || 'wlo1'

console.log(iface);

const exec = cp.exec;


// Main Algorithm to sort arp-scan results
    exec(`sudo arp-scan -l -I ${iface}`, (err,stdout,stderr) => {
        // console.log(stdout);
        let lines = stdout.split('\n');
        console.log(lines.shift());
        console.log(lines.shift());
    
        console.log(lines.pop());
        console.log(lines.pop());
        console.log(lines.pop());
        console.log(lines.pop());
    
        let arr = lines.map((line) => {
            // Match ip address and mac address from line
            let address = line.match(/\d+[.]\d+[.]\d+[.]\d+/i);
            let mac = line.match(/\w+:\w+:\w+:\w+:\w+:\w+/i);
    
            // replace any whitespace with a comma
            let newLine = line.replace(/\s+/g, ',');
    
            // Grab Host name 
            let name = newLine.split(',');
            name.shift();
            name.shift();
            let newName = name.join(' ');
            let matchUnknown = newName.match(/\(Unknown\)/g);
            if (matchUnknown) {
                let match = ouiLookup(mac[0]);
                if (match) {
                    newName = match.split('\n')[0];
                } else {
                    newName = '(Unknown)'
                }
            }
            return {
            
                address: address ? address[0] : null,
                mac: mac ? mac[0] : null,
                name: newName ? newName : null
            }
        })
        // Sort by last last 3 digits in ip address
        arr.sort(function(a,b) {
            let aAdd = a.address.split('.')[3];
            let bAdd = b.address.split('.')[3];
            return Number(aAdd) - Number(bAdd);
        });
    
        arr.forEach((row,i) => {
            // return [row.address,row.mac,row.name];
            console.log(i+getWhiteSpace(i.toString(),2)+
                row.address+getWhiteSpace(row.address,0)+
                row.mac+getWhiteSpace(row.mac,1)+
                row.name
            )
    
    
        });
    
        function getWhiteSpace(data,col) {
            const maxColWidths = [18,22,4];
    
            let counter = maxColWidths[col] - data.length;
            let whiteSpace = '';
            for (let i = 0; i < counter; i++) {
                whiteSpace += ' ';
            }
            return whiteSpace;
        }
    
    });


