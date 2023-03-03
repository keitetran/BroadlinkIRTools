<template>
  <div class="row h-100">
    <div class="col h-100" style="overflow: hidden; overflow-y: auto;">
      <div class="row">
        <div class="col-12">
          <h3 class="mb-0">
            <router-link class="btn btn-secondary btn-sm" to="/"><i class="fas fa-chevron-left" /></router-link>
            <span>Universal code</span>
          </h3>
          <p>Create by Keite Trần https://github.com/keitetran/BroadlinkIRTools
            <br>
            More questtion post <a href="https://github.com/keitetran/BroadlinkIRTools/issues">here</a>
          </p>
        </div>
        <div class="col-12">
          <div class="form-group">
            <h5>Connection status <span class="badge badge-success">{{ $store.state.socketStatus }}</span></h5>
          </div>

          <div class="form-group mb-1" :class="{ 'is-invalid': errors.has('settings.manufacturer') }">
            <label class="mb-0">IR receiver</label>
            <template v-if="availableRemotes && (availableRemotes.length > 0)">
              <select v-model="selectedRemoteId">
                <option v-for="remote in availableRemotes" :key="remote.entity_id">{{ remote.entity_id }}</option>
              </select>
            </template>
            <template v-else-if="availableRemotes">
              <span class="form-group is-invalid">
                <span class="form-text">No remotes found in Home Assistant</span>
              </span>
            </template>
            <template v-else>
              Loading...
            </template>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <h4>2. Import codes storage file</h4>
          Once finished learning the code for each command upload the storage codes file. It is located in your Home Assistant config folder in a sub-folder called <strong>.storage</strong>. Inside of that you should find the storage codes file called something like <strong>broadlink_remote_abc123_codes</strong> (note: your file will have a different value instead of abc123).
          <div class="form-group mb-1">
            <button type="button" :disabled="!irDataReady" class="btn btn-primary btn-sm mt-2" @click="$refs.uploadStorageCodesFileInputElm.click()"> <i class="fas fa-file-upload mr-1" />Import storage codes file</button>
          </div>
          <input ref="uploadStorageCodesFileInputElm" type="file" style="display: none;" @change="handleStorageCodesUpload">
        </div>
      </div>
      <div class="row mt-3">
        <div class="col-12">
          <h4>3. Export to json</h4>
          <div class="form-group mb-1">
            <button type="button" class="btn btn-primary btn-sm mt-2" @click="exportFile()"> <i class="fas fa-file-download mr-1" /> Export JSON file</button>
          </div>
        </div>
      </div>
    </div>
    <div class="col-9 p-0 tableResult">
      <div class="alert alert-warning p-2 mb-0 border-radius-0">
        Click to icon <i :class="$config.iconIr.learn" /> then press your remote button to learn IR code.
        Or icon <i :class="$config.iconIr.learnFalse" /> for relearn IR code if error.
        Please wait for command response.
      </div>
      <table class="table table-bordered mb-0">
        <thead>
          <tr>
            <th class="text-center" style="width: 20px;">#</th>
            <th class="text-center" style="width: 160px;">Name</th>
            <th>IR code</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in irData" :key="index" :ref="'irKey_' + index">
            <td class="text-center">
              <a href="javascript:;" :class="$helper.getTextClassByIcon(item.iconClass)" @click="sendLearnCommand(index)">
                <i :class="item.iconClass" />
              </a>
            </td>
            <td class="text-center">
              <input v-model="item.name" class="form-control form-control-sm" type="text">
            </td>
            <td>{{ item.irCode }}</td>
          </tr>
        </tbody>
      </table>
      <div class="row mt-3 align-content-center">
        <div class="col-7">
          <div class="ml-3 alert alert-info">You can use this tool for convert json to yaml <a href="https://www.json2yaml.com/" target="_blank">json2yaml</a></div>
        </div>
        <div class="col-5 text-right">
          <button class="btn btn-primary mr-3" @click="addMoreCode()">Add new code</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script src="./other.js"></script>
