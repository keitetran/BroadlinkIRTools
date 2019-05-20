import FileSaver from "file-saver";
import {
  config,
  swal
} from "../../../lib";
export default {
  data() {
    return {
      irData: {
        off: {
          key: "off",
          fanMode: "off",
          speed: null,
          irCode: "",
          iconClass: config.iconIr.learn
        }
      },
      irDataReady: false,
      hassInfo: undefined,
      settings: {
        manufacturer: "Unknown",
        supportedModels: "Unknown",
        supportedController: ["Broadlink"],
        supportedControllerSelected: "Broadlink",
        fanModes: "reverse, forward",
        speeds: "level1, level2, level3, level4, level5, level6"
      },
      sendTarget: undefined
    };
  },
  computed: {
    hassInfoStatus() {
      if (this.$store.state.socketStatus !== config.socketStatus.connected) return true;
      if (this.irDataReady === true) return true;
      return false;
    }
  },
  watch: {
    "$store.state.socketMsgs": {
      deep: true,
      handler: function (evData) {
        console.log("xxx", evData);
        if (evData.event && evData.event.data.new_state.state === "notifying" && evData.event.event_type === "state_changed") {
          let message = evData.event.data.new_state.attributes.message;
          let irCode = message.replace("Received packet is: ", "");
          this.$set(this.irData[this.sendTarget.key], "irCode", irCode);

          if (message === "Did not received any signal") {
            this.$set(this.irData[this.sendTarget.key], "iconClass", config.iconIr.learnFalse);
            return;
          }

          this.$set(this.irData[this.sendTarget.key], "iconClass", config.iconIr.learnSuccess);
          this.sendTarget = undefined;
        }
      }
    }
  },
  mounted() {
    if (this.$store.state.hassInfo) {
      this.hassInfo = this.$store.state.hassInfo;
    } else {
      return this.$router.push({
        path: "/"
      });
    };
  },
  methods: {
    exportFile() {
      let jsonData = {
        manufacturer: this.settings.manufacturer,
        supportedModels: this.settings.supportedModels.split(",").map(m => m.trim()),
        supportedController: this.settings.supportedControllerSelected,
        commandsEncoding: "Base64",
        speeds: this.settings.speeds.split(",").map(m => m.trim()),
        commands: {}
      };

      Object.keys(this.irData).forEach(key => {
        let m = this.irData[key];
        if (m.fanMode === "off") {
          jsonData.commands[m.fanMode] = m.irCode;
        } else {
          if (!jsonData.commands[m.fanMode]) jsonData.commands[m.fanMode] = {};
          jsonData.commands[m.fanMode][m.speed] = m.irCode;
        }
      });

      var blob = new Blob([JSON.stringify(jsonData, "")], {
        type: "application/json;charset=utf-8"
      });

      FileSaver.saveAs(blob, "your-ir-code.json");
      swal("Good job!", "Your file was downloaded! Please note that the device_code field only accepts positive numbers. The .json extension is not required.", "success", {
        button: "Oki!"
      });
    },
    setupComponent() {
      this.$validator.validateAll().then((result) => {
        if (!result) return alert("Please enter field is required.");
        this.irDataReady = true;
        let _that = this;
        _that.settings.fanModes.split(",").forEach(fanMode => {
          fanMode = fanMode.trim();
          _that.settings.speeds.split(",").forEach(speed => {
            speed = speed.trim();
            _that.$set(_that.irData, `${fanMode}_${speed}`, {
              key: `${fanMode}_${speed}`,
              fanMode: fanMode,
              speed: speed,
              irCode: "",
              iconClass: config.iconIr.learn
            });
          });
        });
      });
    },
    sendLearnCommand(_target) {
      console.log("Command was send..", _target.key);
      this.sendTarget = _target;
      this.$set(this.irData[this.sendTarget.key], "iconClass", config.iconIr.learning);

      this.$store.state.socket.send(JSON.stringify({
        id: this.$store.state.socketId++,
        type: "call_service",
//        domain: "switch",
        domain: "script",
        service: this.$store.state.hassInfo.serviceCommand
      }));
    },
    changeBroadlinkCommand() {
      this.$store.state.hassInfo.serviceCommand = this.hassInfo.serviceCommand;
    }
  }
};