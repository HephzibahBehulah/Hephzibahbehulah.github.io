window.CYBER_GRAPH={nodes:[
["HTTPS","443"],["443","TCP"],["TCP","OSI Layer 4"],["OSI Layer 4","Transport"],["HTTPS","TLS"],["TLS","Certificate"],["Certificate","Trust"],["DNS","53"],["53","UDP/TCP"],["Event","Detect"],["Detect","Respond"],["Respond","Recover"],["NIST CSF 2.0","Govern"],["NIST CSF 2.0","Identify"],["NIST CSF 2.0","Protect"],["NIST CSF 2.0","Detect"],["NIST CSF 2.0","Respond"],["NIST CSF 2.0","Recover"]
],sources:[
{name:"NIST CSF 2.0",url:"https://www.nist.gov/cyberframework",scope:"Framework reference"},
{name:"MITRE ATT&CK",url:"https://attack.mitre.org/",scope:"Adversary behavior"},
{name:"OWASP",url:"https://owasp.org/",scope:"Application security"},
{name:"CIS Controls",url:"https://www.cisecurity.org/controls",scope:"Safeguards"},
{name:"IETF RFCs",url:"https://www.rfc-editor.org/",scope:"Internet protocols"},
{name:"Microsoft Learn",url:"https://learn.microsoft.com/",scope:"Windows and PowerShell"},
{name:"Linux man-pages",url:"https://man7.org/linux/man-pages/",scope:"Linux command reference"}
]};