import {
  config,
  helper
} from "../../../lib";
export default {
  data() {
    return {
      irData: {},
      hassInfo: undefined,
      settings: {
        manufacturer: "Unknown",
        supportedModels: "Unknown",
        supportedController: ["Broadlink"],
        supportedControllerSelected: "Broadlink",
        modes: undefined,
        sources: undefined,
        storageFileDeviceKey: undefined
      },
      currentLearningInfo: undefined,
      availableRemotes: [],
      selectedRemoteId: undefined,
      irDataReady: false,

      // Mix source
      sourceSelected: [],
      sourceName: undefined
    };
  },
  computed: {
    sourceList() {
      return this.settings.sources.split(",").map(m => m.trim());
    },
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
        if (this.currentLearningInfo && (evData.id === this.currentLearningInfo.messageId)) {
          if (evData.type === "result" && evData.success === true) {
            this.$set(this.irData[this.currentLearningInfo.command.key], "iconClass", config.iconIr.learnSuccess);
            this.currentLearningInfo = undefined;
            return;
          }

          this.$set(this.irData[this.currentLearningInfo.command.key], "iconClass", config.iconIr.learnFalse);
        }
      }
    }
  },
  mounted() {
    if (this.$store.state.socketStatus === config.socketStatus.connected) {
      this.hassInfo = this.$store.state.hassInfo;
      this.settings.modes = "off, on, previousChannel, nextChannel, volumeDown, volumeUp, mute";
      this.settings.sources = "EXT1, EXT2, VGA, HDMI";
      helper.getRemotes().then(remotes => {
        this.availableRemotes = remotes;
        this.selectedRemoteId = this.availableRemotes[0]?.entity_id;
      });
    } else {
      return this.$router.push({
        path: "/"
      });
    };
  },
  methods: {
    handleStorageCodesUpload(event) {
      helper.extractCodesFromStorageCodesFile({
        storageFileDeviceKey: this.settings.storageFileDeviceKey,
        storageCodesFile: event.target.files[0],
        irData: this.irData
      });
    },
    exportFile() {
      let jsonData = {
        manufacturer: this.settings.manufacturer,
        supportedModels: this.settings.supportedModels.split(",").map(m => m.replace(" ", "")),
        supportedController: this.settings.supportedControllerSelected,
        commandsEncoding: "Base64",
        commands: {}
      };

      Object.keys(this.irData).forEach(key => {
        let m = this.irData[key];
        if (m.command === "source") {
          if (!jsonData.commands["sources"]) jsonData.commands["sources"] = {};
          jsonData.commands["sources"][m.source] = m.irCode;
        } else {
          jsonData.commands[m.command] = m.irCode;
        }
      });

      // export file
      helper.exportFileSaver(jsonData);
    },
    setupComponent() {
      this.$validator.validateAll().then((result) => {
        this.irDataReady = true;
        if (!result) return alert("Please enter field is required.");
        let tempData = {};

        this.settings.modes.split(",").forEach(mode => {
          mode = mode.trim();
          tempData[mode] = {
            key: `${mode}`,
            command: mode,
            source: undefined,
            irCode: "",
            iconClass: config.iconIr.learn
          };
        });

        this.settings.sources.split(",").forEach(source => {
          source = source.trim();
          tempData[`source_${source}`] = {
            key: `source_${source}`,
            command: "source",
            source: source,
            irCode: "",
            iconClass: config.iconIr.learn
          };
        });

        this.irData = tempData;

        this.settings.storageFileDeviceKey = `BroadlinkIRTools - ${this.settings.manufacturer} - ` +
          `${this.settings.supportedModels} - ${Math.floor(Math.random() * 1000000)}`;
      });
    },
    sendLearnCommand(_target) {
      const messageId = helper.sendBroadlinkLearnCmd({
        remoteId: this.selectedRemoteId,
        command: _target.key,
        storageFileDeviceKey: this.settings.storageFileDeviceKey
      });
      console.log("Command was send..", _target.key);
      this.currentLearningInfo = {
        command: _target,
        messageId
      };
      this.$set(this.irData[this.currentLearningInfo.command.key], "iconClass", config.iconIr.learning);
    },
    mixSource() {
      if (this.sourceSelected.length < 2) return alert("Chọn tối thiểu 2 đơn vị");
      this.irData.map(m1 => {
        if (m1.key === this.sourceSelected.map(m2 => `source_${m2}` === m1.key)) {
          if (m1.irCode === "") return alert("Ircode was nulled");
        }
      });
    }
  }
};