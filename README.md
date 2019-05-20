# ADDED WORKAROUND FOR ISSUE #7
REFERENCE: https://github.com/keitetran/BroadlinkIRTools/issues/7

The new service for learning is called "broadlink.learn" and needs the ip host to put it in learning mode. <br>
**The work around consists in calling a script to make this.**

It's necessary to add script like this:
```
'broadlink_learn_command_192_168_1_13':
  alias: broadlink_learn_command_192_168_1_13
  sequence:
  - data:
      host: 192.168.1.13
    service: broadlink.learn
```
*Adjust with your ip and preferred name.*

**In the field "Broadlink service" of the service page put only then name of the script.** (example: ```broadlink_learn_command_192_168_1_13```).

N.B.: It's a workaroud, please understand, I have too low knowledge of nodejs to made a more elegant solution.

# URL FOR THIS FORK
https://unclehook.github.io/BroadlinkIRTools/#/

I was publish full source code and change tool url. Please help me fix bug when HASS APi was change. 

# Broadlink tools
This tool support for SmartIR  https://github.com/smartHomeHub/SmartIR <br>
You can use it from this page  https://unclehook.github.io/BroadlinkIRTools/#/

## How it work
- Disable ads block on browser. I dont add anymore ads to this site, but adblocker will block connection to your hass :( Sorry for the inconvenience
- This will connect to your hass via webservice 

## This is  testing version 
- Support create cimate code from Broadlink
- Support create media code
- Support fan code
- Support universal code
- Import and edit your json (not yet)
- Support create climate with Swing (not yet)

# For developer 
```
git clone https://github.com/unclehook/BroadlinkIRTools.git
cd BroadlinkIRTools
npm i
npm run dev
```

Build code and commit
```
npm run build
```
