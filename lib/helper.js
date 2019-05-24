import config from "./config";
import store from "./store";
export default {
  sendBroadlinkLearnCmd(_ip) {
    store.state.socket.send(JSON.stringify({
      id: store.state.socketId++,
      type: "call_service",
      domain: "broadlink",
      service: "learn",
      service_data: {
        host: _ip
      }
    }));
  },
  getDupicateItem(_str1, _str2) {
    let temp = [];
    _str1.split(",").map(m1 => {
      m1 = m1.trim();
      _str2.split(",").map(m2 => {
        m2 = m2.trim();
        if (m1 === m2) temp.push(m2);
      });
    });
    return temp;
  },
  getTextClassByIcon(_icon) {
    switch (_icon) {
      case config.iconIr.learn:
        return "text-secondary";
      case config.iconIr.learnFalse:
        return "text-danger";
      case config.iconIr.learnSuccess:
        return "text-success";
      case config.iconIr.learning:
        return "text-primary";
      default:
        return "text-secondary";
    }
  }
};