<template>
  <div class="system-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">
            <i class="el-icon-setting"></i>
            系统设置
          </h2>
          <div class="page-description">管理系统的基本配置和参数设置</div>
        </div>
        <div class="header-actions">
          <el-button type="success" icon="el-icon-check" size="small" @click="saveAllSettings" :loading="saving">保存全部设置</el-button>
        </div>
      </div>
    </div>

    <!-- 设置内容区域 -->
    <div class="settings-container">
      <!-- 左侧导航 -->
      <div class="settings-sidebar">
        <el-menu
          :default-active="activeTab"
          class="settings-menu"
          @select="handleTabChange"
          background-color="#ffffff"
          text-color="#606266"
          active-text-color="#409eff">
          <el-menu-item index="basic">
            <i class="el-icon-info"></i>
            <span>基本设置</span>
          </el-menu-item>
          <el-menu-item index="company">
            <i class="el-icon-office-building"></i>
            <span>企业信息</span>
          </el-menu-item>
          <el-menu-item index="system">
            <i class="el-icon-cpu"></i>
            <span>系统参数</span>
          </el-menu-item>
          <el-menu-item index="security">
            <i class="el-icon-lock"></i>
            <span>安全设置</span>
          </el-menu-item>
          <el-menu-item index="notification">
            <i class="el-icon-bell"></i>
            <span>通知设置</span>
          </el-menu-item>
          <el-menu-item index="backup">
            <i class="el-icon-folder-opened"></i>
            <span>备份设置</span>
          </el-menu-item>
          <el-menu-item index="email">
            <i class="el-icon-message"></i>
            <span>邮件配置</span>
          </el-menu-item>
          <el-menu-item index="logs">
            <i class="el-icon-document"></i>
            <span>日志设置</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧内容区 -->
      <div class="settings-content">
        <!-- 基本设置 -->
        <div v-show="activeTab === 'basic'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-info"></i>
                基本设置
              </div>
              <div class="card-description">系统的基础配置信息</div>
            </div>

            <el-form :model="basicSettings" label-width="120px" class="setting-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="系统名称">
                    <el-input v-model="basicSettings.systemName" placeholder="请输入系统名称">
                      <template slot="prefix">
                        <i class="el-icon-platform-eleme"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="系统版本">
                    <el-input v-model="basicSettings.systemVersion" placeholder="请输入系统版本">
                      <template slot="prefix">
                        <i class="el-icon-postcard"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="系统标题">
                    <el-input v-model="basicSettings.systemTitle" placeholder="浏览器标题栏显示">
                      <template slot="prefix">
                        <i class="el-icon-collection-tag"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="系统关键词">
                    <el-input v-model="basicSettings.systemKeywords" placeholder="SEO关键词">
                      <template slot="prefix">
                        <i class="el-icon-search"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="系统描述">
                    <el-input
                      v-model="basicSettings.systemDescription"
                      type="textarea"
                      :rows="3"
                      placeholder="请输入系统描述信息..."
                      maxlength="200"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="系统状态">
                    <el-switch
                      v-model="basicSettings.systemStatus"
                      active-text="正常运行"
                      inactive-text="维护模式"
                      active-color="#67c23a"
                      inactive-color="#f56c6c" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="新用户注册">
                    <el-switch
                      v-model="basicSettings.allowRegister"
                      active-text="允许"
                      inactive-text="禁止"
                      active-color="#409eff"
                      inactive-color="#909399" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </div>

        <!-- 企业信息 -->
        <div v-show="activeTab === 'company'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-office-building"></i>
                企业信息
              </div>
              <div class="card-description">企业的基本信息和联系方式</div>
            </div>

            <el-form :model="companySettings" label-width="120px" class="setting-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="企业名称">
                    <el-input v-model="companySettings.companyName" placeholder="请输入企业名称">
                      <template slot="prefix">
                        <i class="el-icon-office-building"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="统一社会信用代码">
                    <el-input v-model="companySettings.creditCode" placeholder="请输入统一社会信用代码">
                      <template slot="prefix">
                        <i class="el-icon-postcard"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="法定代表人">
                    <el-input v-model="companySettings.legalPerson" placeholder="请输入法定代表人">
                      <template slot="prefix">
                        <i class="el-icon-user"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="联系电话">
                    <el-input v-model="companySettings.phone" placeholder="请输入联系电话">
                      <template slot="prefix">
                        <i class="el-icon-phone"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="电子邮箱">
                    <el-input v-model="companySettings.email" placeholder="请输入电子邮箱">
                      <template slot="prefix">
                        <i class="el-icon-message"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="官方网站">
                    <el-input v-model="companySettings.website" placeholder="请输入官方网站">
                      <template slot="prefix">
                        <i class="el-icon-link"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="企业地址">
                    <el-input v-model="companySettings.address" placeholder="请输入企业详细地址">
                      <template slot="prefix">
                        <i class="el-icon-location"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="企业简介">
                    <el-input
                      v-model="companySettings.description"
                      type="textarea"
                      :rows="4"
                      placeholder="请输入企业简介..."
                      maxlength="500"
                      show-word-limit />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </div>

        <!-- 系统参数 -->
        <div v-show="activeTab === 'system'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-cpu"></i>
                系统参数
              </div>
              <div class="card-description">系统运行的各项参数配置</div>
            </div>

            <el-form :model="systemSettings" label-width="120px" class="setting-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="分页大小">
                    <el-input-number
                      v-model="systemSettings.pageSize"
                      :min="10"
                      :max="100"
                      :step="10"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="会话超时(分钟)">
                    <el-input-number
                      v-model="systemSettings.sessionTimeout"
                      :min="30"
                      :max="1440"
                      :step="30"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="文件上传大小(MB)">
                    <el-input-number
                      v-model="systemSettings.uploadMaxSize"
                      :min="1"
                      :max="100"
                      :step="1"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="缓存过期时间(小时)">
                    <el-input-number
                      v-model="systemSettings.cacheExpireTime"
                      :min="1"
                      :max="72"
                      :step="1"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="默认语言">
                    <el-select v-model="systemSettings.defaultLanguage" placeholder="请选择默认语言" style="width: 100%">
                      <el-option label="简体中文" value="zh-CN" />
                      <el-option label="繁体中文" value="zh-TW" />
                      <el-option label="English" value="en-US" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="时区设置">
                    <el-select v-model="systemSettings.timezone" placeholder="请选择时区" style="width: 100%">
                      <el-option label="北京时间 (UTC+8)" value="Asia/Shanghai" />
                      <el-option label="东京时间 (UTC+9)" value="Asia/Tokyo" />
                      <el-option label="纽约时间 (UTC-5)" value="America/New_York" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="启用缓存">
                    <el-switch
                      v-model="systemSettings.enableCache"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#67c23a"
                      inactive-color="#f56c6c" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="调试模式">
                    <el-switch
                      v-model="systemSettings.debugMode"
                      active-text="开启"
                      inactive-text="关闭"
                      active-color="#e6a23c"
                      inactive-color="#909399" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </div>

        <!-- 安全设置 -->
        <div v-show="activeTab === 'security'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-lock"></i>
                安全设置
              </div>
              <div class="card-description">系统安全相关的配置选项</div>
            </div>

            <el-form :model="securitySettings" label-width="120px" class="setting-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="密码最小长度">
                    <el-input-number
                      v-model="securitySettings.passwordMinLength"
                      :min="6"
                      :max="20"
                      :step="1"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="登录失败锁定次数">
                    <el-input-number
                      v-model="securitySettings.loginFailLockCount"
                      :min="3"
                      :max="10"
                      :step="1"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="账户锁定时间(分钟)">
                    <el-input-number
                      v-model="securitySettings.lockDuration"
                      :min="5"
                      :max="120"
                      :step="5"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="密码过期天数">
                    <el-input-number
                      v-model="securitySettings.passwordExpireDays"
                      :min="30"
                      :max="365"
                      :step="30"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="强制密码复杂度">
                    <el-switch
                      v-model="securitySettings.forceComplexPassword"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#67c23a"
                      inactive-color="#f56c6c" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="启用双因素认证">
                    <el-switch
                      v-model="securitySettings.enableTwoFactor"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#409eff"
                      inactive-color="#909399" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="IP白名单验证">
                    <el-switch
                      v-model="securitySettings.enableIpWhitelist"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#e6a23c"
                      inactive-color="#909399" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="登录验证码">
                    <el-switch
                      v-model="securitySettings.enableCaptcha"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#67c23a"
                      inactive-color="#f56c6c" />
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </el-card>
        </div>

        <!-- 通知设置 -->
        <div v-show="activeTab === 'notification'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-bell"></i>
                通知设置
              </div>
              <div class="card-description">系统消息和通知的配置</div>
            </div>

            <el-form :model="notificationSettings" label-width="120px" class="setting-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="邮件通知">
                    <el-switch
                      v-model="notificationSettings.enableEmail"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#67c23a"
                      inactive-color="#f56c6c" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="短信通知">
                    <el-switch
                      v-model="notificationSettings.enableSms"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#409eff"
                      inactive-color="#909399" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="系统消息">
                    <el-switch
                      v-model="notificationSettings.enableSystemMessage"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#e6a23c"
                      inactive-color="#909399" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="浏览器推送">
                    <el-switch
                      v-model="notificationSettings.enableBrowserPush"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#f56c6c"
                      inactive-color="#909399" />
                  </el-form-item>
                </el-col>
              </el-row>

              <div class="notification-types">
                <h4 class="section-title">通知类型设置</h4>
                <el-table :data="notificationTypes" border size="small">
                  <el-table-column prop="name" label="通知类型" width="200" />
                  <el-table-column label="邮件" width="80" align="center">
                    <template slot-scope="scope">
                      <el-switch v-model="scope.row.email" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column label="短信" width="80" align="center">
                    <template slot-scope="scope">
                      <el-switch v-model="scope.row.sms" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column label="系统消息" width="100" align="center">
                    <template slot-scope="scope">
                      <el-switch v-model="scope.row.system" size="mini" />
                    </template>
                  </el-table-column>
                  <el-table-column prop="description" label="说明" />
                </el-table>
              </div>
            </el-form>
          </el-card>
        </div>

        <!-- 备份设置 -->
        <div v-show="activeTab === 'backup'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-folder-opened"></i>
                备份设置
              </div>
              <div class="card-description">数据备份和恢复相关配置</div>
            </div>

            <el-form :model="backupSettings" label-width="120px" class="setting-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="自动备份">
                    <el-switch
                      v-model="backupSettings.enableAutoBackup"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#67c23a"
                      inactive-color="#f56c6c" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="备份频率">
                    <el-select v-model="backupSettings.backupFrequency" placeholder="请选择备份频率" style="width: 100%">
                      <el-option label="每天" value="daily" />
                      <el-option label="每周" value="weekly" />
                      <el-option label="每月" value="monthly" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="保留备份数量">
                    <el-input-number
                      v-model="backupSettings.keepBackupCount"
                      :min="1"
                      :max="30"
                      :step="1"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="备份时间">
                    <el-time-picker
                      v-model="backupSettings.backupTime"
                      format="HH:mm"
                      value-format="HH:mm"
                      placeholder="选择备份时间"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="备份路径">
                    <el-input v-model="backupSettings.backupPath" placeholder="备份文件存储路径">
                      <template slot="prefix">
                        <i class="el-icon-folder"></i>
                      </template>
                      <el-button slot="append" icon="el-icon-folder-opened" @click="selectBackupPath">选择</el-button>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <div class="backup-actions">
                <el-button type="primary" icon="el-icon-download" @click="createBackup" :loading="backupLoading">立即备份</el-button>
                <el-button type="success" icon="el-icon-upload2" @click="showRestoreDialog">恢复备份</el-button>
                <el-button type="info" icon="el-icon-view" @click="viewBackupList">查看备份</el-button>
              </div>
            </el-form>
          </el-card>
        </div>

        <!-- 邮件配置 -->
        <div v-show="activeTab === 'email'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-message"></i>
                邮件配置
              </div>
              <div class="card-description">SMTP邮件服务器配置</div>
            </div>

            <el-form :model="emailSettings" label-width="120px" class="setting-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="SMTP服务器">
                    <el-input v-model="emailSettings.smtpHost" placeholder="如：smtp.163.com">
                      <template slot="prefix">
                        <i class="el-icon-link"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="SMTP端口">
                    <el-input-number v-model="emailSettings.smtpPort" :min="1" :max="65535" controls-position="right" style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="发件人邮箱">
                    <el-input v-model="emailSettings.senderEmail" placeholder="发件人邮箱地址">
                      <template slot="prefix">
                        <i class="el-icon-message"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="发件人名称">
                    <el-input v-model="emailSettings.senderName" placeholder="发件人显示名称">
                      <template slot="prefix">
                        <i class="el-icon-user"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="邮箱密码">
                    <el-input v-model="emailSettings.password" type="password" placeholder="邮箱密码或授权码" show-password>
                      <template slot="prefix">
                        <i class="el-icon-lock"></i>
                      </template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="加密方式">
                    <el-select v-model="emailSettings.encryption" placeholder="请选择加密方式" style="width: 100%">
                      <el-option label="无加密" value="none" />
                      <el-option label="SSL" value="ssl" />
                      <el-option label="TLS" value="tls" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>

              <div class="email-actions">
                <el-button type="primary" icon="el-icon-message" @click="testEmailConnection" :loading="emailTesting">测试连接</el-button>
                <el-button type="success" icon="el-icon-s-promotion" @click="sendTestEmail" :loading="emailTesting">发送测试邮件</el-button>
              </div>
            </el-form>
          </el-card>
        </div>

        <!-- 日志设置 -->
        <div v-show="activeTab === 'logs'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-document"></i>
                日志设置
              </div>
              <div class="card-description">系统日志记录和管理配置</div>
            </div>

            <el-form :model="logSettings" label-width="120px" class="setting-form">
              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="启用系统日志">
                    <el-switch
                      v-model="logSettings.enableSystemLog"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#67c23a"
                      inactive-color="#f56c6c" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="启用操作日志">
                    <el-switch
                      v-model="logSettings.enableOperationLog"
                      active-text="启用"
                      inactive-text="禁用"
                      active-color="#409eff"
                      inactive-color="#909399" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="12">
                  <el-form-item label="日志级别">
                    <el-select v-model="logSettings.logLevel" placeholder="请选择日志级别" style="width: 100%">
                      <el-option label="调试 (DEBUG)" value="debug" />
                      <el-option label="信息 (INFO)" value="info" />
                      <el-option label="警告 (WARN)" value="warn" />
                      <el-option label="错误 (ERROR)" value="error" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="日志保留天数">
                    <el-input-number
                      v-model="logSettings.logRetentionDays"
                      :min="7"
                      :max="365"
                      :step="1"
                      controls-position="right"
                      style="width: 100%" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-row :gutter="24">
                <el-col :span="24">
                  <el-form-item label="日志文件路径">
                    <el-input v-model="logSettings.logPath" placeholder="日志文件存储路径">
                      <template slot="prefix">
                        <i class="el-icon-folder"></i>
                      </template>
                      <el-button slot="append" icon="el-icon-folder-opened" @click="selectLogPath">选择</el-button>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>

              <div class="log-actions">
                <el-button type="primary" icon="el-icon-view" @click="viewLogs">查看日志</el-button>
                <el-button type="warning" icon="el-icon-delete" @click="clearLogs">清空日志</el-button>
                <el-button type="success" icon="el-icon-download" @click="downloadLogs">下载日志</el-button>
              </div>
            </el-form>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SystemSettings',
  data() {
    return {
      // 当前活动的标签页
      activeTab: 'basic',

      // 保存状态
      saving: false,
      backupLoading: false,
      emailTesting: false,

      // 基本设置
      basicSettings: {
        systemName: '流旭MES系统',
        systemVersion: 'v1.0.0',
        systemTitle: '流旭MES - 制造执行系统',
        systemKeywords: 'MES,制造执行系统,生产管理',
        systemDescription: '专业的制造执行系统，提供完整的生产过程管理解决方案',
        systemStatus: true,
        allowRegister: false
      },

      // 企业信息
      companySettings: {
        companyName: '',
        creditCode: '',
        legalPerson: '',
        phone: '',
        email: '',
        website: '',
        address: '',
        description: ''
      },

      // 系统参数
      systemSettings: {
        pageSize: 20,
        sessionTimeout: 120,
        uploadMaxSize: 10,
        cacheExpireTime: 24,
        defaultLanguage: 'zh-CN',
        timezone: 'Asia/Shanghai',
        enableCache: true,
        debugMode: false
      },

      // 安全设置
      securitySettings: {
        passwordMinLength: 8,
        loginFailLockCount: 5,
        lockDuration: 30,
        passwordExpireDays: 90,
        forceComplexPassword: true,
        enableTwoFactor: false,
        enableIpWhitelist: false,
        enableCaptcha: true
      },

      // 通知设置
      notificationSettings: {
        enableEmail: true,
        enableSms: false,
        enableSystemMessage: true,
        enableBrowserPush: false
      },

      // 通知类型
      notificationTypes: [
        { name: '用户登录', email: true, sms: false, system: true, description: '用户登录系统时通知' },
        { name: '密码修改', email: true, sms: true, system: true, description: '用户修改密码时通知' },
        { name: '系统异常', email: true, sms: true, system: true, description: '系统发生异常时通知' },
        { name: '数据备份', email: true, sms: false, system: false, description: '数据备份完成时通知' },
        { name: '任务完成', email: false, sms: false, system: true, description: '任务执行完成时通知' }
      ],

      // 备份设置
      backupSettings: {
        enableAutoBackup: true,
        backupFrequency: 'daily',
        keepBackupCount: 7,
        backupTime: '02:00',
        backupPath: '/data/backup'
      },

      // 邮件设置
      emailSettings: {
        smtpHost: '',
        smtpPort: 587,
        senderEmail: '',
        senderName: '',
        password: '',
        encryption: 'tls'
      },

      // 日志设置
      logSettings: {
        enableSystemLog: true,
        enableOperationLog: true,
        logLevel: 'info',
        logRetentionDays: 30,
        logPath: '/data/logs'
      }
    }
  },

  created() {
    this.loadSettings()
  },

  methods: {
    // 切换标签页
    handleTabChange(key) {
      this.activeTab = key
    },

    // 加载设置
    async loadSettings() {
      try {
        // TODO: 从后端加载设置数据
        console.log('加载设置数据...')
      } catch (error) {
        this.$message.error('加载设置失败')
      }
    },

    // 保存所有设置
    async saveAllSettings() {
      this.saving = true
      try {
        // TODO: 保存所有设置到后端
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟保存
        this.$message.success('设置保存成功')
      } catch (error) {
        this.$message.error('保存设置失败')
      } finally {
        this.saving = false
      }
    },

    // 选择备份路径
    selectBackupPath() {
      this.$message.info('功能开发中...')
    },

    // 创建备份
    async createBackup() {
      this.backupLoading = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000)) // 模拟备份
        this.$message.success('备份创建成功')
      } catch (error) {
        this.$message.error('备份创建失败')
      } finally {
        this.backupLoading = false
      }
    },

    // 显示恢复对话框
    showRestoreDialog() {
      this.$message.info('恢复功能开发中...')
    },

    // 查看备份列表
    viewBackupList() {
      this.$message.info('备份列表功能开发中...')
    },

    // 测试邮件连接
    async testEmailConnection() {
      this.emailTesting = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000)) // 模拟测试
        this.$message.success('邮件服务器连接成功')
      } catch (error) {
        this.$message.error('邮件服务器连接失败')
      } finally {
        this.emailTesting = false
      }
    },

    // 发送测试邮件
    async sendTestEmail() {
      this.emailTesting = true
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500)) // 模拟发送
        this.$message.success('测试邮件发送成功')
      } catch (error) {
        this.$message.error('测试邮件发送失败')
      } finally {
        this.emailTesting = false
      }
    },

    // 选择日志路径
    selectLogPath() {
      this.$message.info('功能开发中...')
    },

    // 查看日志
    viewLogs() {
      this.$message.info('日志查看功能开发中...')
    },

    // 清空日志
    async clearLogs() {
      try {
        await this.$confirm('确认清空所有日志文件吗？', '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        this.$message.success('日志清空成功')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('日志清空失败')
        }
      }
    },

    // 下载日志
    downloadLogs() {
      this.$message.info('日志下载功能开发中...')
    }
  }
}
</script>

<style lang="scss" scoped>
.system-settings {
  padding: 0;
  background: #f5f7fa;
  min-height: 100vh;

  // 页面头部样式
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 24px 32px;
    margin-bottom: 20px;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }

    .header-left {
      .page-title {
        margin: 0 0 8px 0;
        font-size: 28px;
        font-weight: 600;
        display: flex;
        align-items: center;

        i {
          margin-right: 12px;
          font-size: 32px;
        }
      }

      .page-description {
        font-size: 14px;
        opacity: 0.9;
        font-weight: 400;
      }
    }

    .header-actions {
      .el-button {
        background: #67c23a;
        border-color: #67c23a;
        box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);

        &:hover {
          background: #5daf34;
          border-color: #5daf34;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
        }
      }
    }
  }

  // 设置容器
  .settings-container {
    display: flex;
    max-width: 1400px;
    margin: 0 auto;
    gap: 20px;
    padding: 0 20px;

    // 左侧导航
    .settings-sidebar {
      width: 250px;
      flex-shrink: 0;

      .settings-menu {
        border-radius: 12px;
        border: none;
        box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
        overflow: hidden;

        .el-menu-item {
          height: 50px;
          line-height: 50px;
          border-bottom: 1px solid #f0f0f0;
          transition: all 0.3s ease;

          &:hover {
            background-color: #f8f9ff;
            color: #409eff;
          }

          &.is-active {
            background-color: #409eff;
            color: white;
            font-weight: 600;

            &::after {
              display: none;
            }
          }

          i {
            margin-right: 8px;
            font-size: 16px;
          }

          &:last-child {
            border-bottom: none;
          }
        }
      }
    }

    // 右侧内容区
    .settings-content {
      flex: 1;
      min-width: 0;

      .setting-panel {
        .setting-card {
          border-radius: 12px;
          border: none;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

          .card-header {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .card-title {
              font-size: 18px;
              font-weight: 600;
              color: #303133;
              display: flex;
              align-items: center;

              i {
                margin-right: 8px;
                color: #409eff;
                font-size: 20px;
              }
            }

            .card-description {
              font-size: 14px;
              color: #909399;
            }
          }

          .setting-form {
            .el-form-item {
              margin-bottom: 24px;

              .el-input {
                ::v-deep .el-input__inner {
                  border-radius: 6px;
                  border: 1px solid #dcdfe6;
                  transition: all 0.3s ease;

                  &:focus {
                    border-color: #409eff;
                    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
                  }
                }
              }

              .el-switch {
                .el-switch__label {
                  font-size: 14px;
                  font-weight: 500;
                }
              }
            }

            // 特殊组件样式
            .notification-types {
              margin-top: 30px;

              .section-title {
                font-size: 16px;
                font-weight: 600;
                color: #303133;
                margin-bottom: 16px;
                padding-bottom: 8px;
                border-bottom: 1px solid #ebeef5;
              }

              .el-table {
                border-radius: 8px;
                overflow: hidden;
              }
            }

            .backup-actions,
            .email-actions,
            .log-actions {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ebeef5;
              display: flex;
              gap: 12px;

              .el-button {
                border-radius: 6px;
                padding: 10px 20px;
                font-weight: 500;

                &:hover {
                  transform: translateY(-1px);
                  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
              }
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .system-settings {
    .settings-container {
      flex-direction: column;
      padding: 0 10px;

      .settings-sidebar {
        width: 100%;

        .settings-menu {
          display: flex;
          overflow-x: auto;

          .el-menu-item {
            flex-shrink: 0;
            min-width: 120px;
            text-align: center;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .system-settings {
    .page-header {
      padding: 16px 20px;

      .header-content {
        flex-direction: column;
        gap: 16px;
        align-items: flex-start;

        .header-left {
          .page-title {
            font-size: 24px;

            i {
              font-size: 28px;
            }
          }
        }

        .header-actions {
          align-self: stretch;

          .el-button {
            width: 100%;
          }
        }
      }
    }

    .settings-container {
      padding: 0 10px;

      .settings-content {
        .setting-panel {
          .setting-card {
            .setting-form {
              .el-row {
                .el-col {
                  width: 100% !important;
                  margin-bottom: 12px;
                }
              }

              .backup-actions,
              .email-actions,
              .log-actions {
                flex-direction: column;

                .el-button {
                  width: 100%;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
