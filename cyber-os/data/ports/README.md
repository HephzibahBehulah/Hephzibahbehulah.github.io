# IANA port registry

Cyber OS treats IANA as the authoritative source for assigned service names and transport protocol port numbers.

Source:
https://www.iana.org/assignments/service-names-port-numbers/

The sync script downloads the official CSV and writes a normalized JSON data pack. The generated file is intentionally source-backed and timestamped; it is not hand-filled to reach a target count.

IANA defines System Ports as 0-1023, User Ports as 1024-49151, and Dynamic/Private Ports as 49152-65535. Registration does not prove that traffic using a port is legitimate or that it actually corresponds to the registered service.

Run:
node scripts/sync-iana-ports.mjs

The scheduled GitHub workflow refreshes this dataset automatically.