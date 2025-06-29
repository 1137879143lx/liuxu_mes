<template>
  <div class="user-settings">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-left">
          <h2 class="page-title">
            <i class="el-icon-user-solid"></i>
            用户设置
          </h2>
          <div class="page-description">管理系统用户、角色权限和组织架构</div>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <div class="stat-number">{{ totalUsers }}</div>
            <div class="stat-label">总用户数</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ onlineUsers }}</div>
            <div class="stat-label">在线用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ totalRoles }}</div>
            <div class="stat-label">角色数量</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
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
          <el-menu-item index="users">
            <i class="el-icon-user"></i>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="roles">
            <i class="el-icon-s-check"></i>
            <span>角色管理</span>
          </el-menu-item>
          <el-menu-item index="permissions">
            <i class="el-icon-lock"></i>
            <span>权限管理</span>
          </el-menu-item>
          <el-menu-item index="departments">
            <i class="el-icon-office-building"></i>
            <span>部门管理</span>
          </el-menu-item>
          <el-menu-item index="positions">
            <i class="el-icon-postcard"></i>
            <span>职位管理</span>
          </el-menu-item>
          <el-menu-item index="groups">
            <i class="el-icon-s-custom"></i>
            <span>用户组管理</span>
          </el-menu-item>
        </el-menu>
      </div>

      <!-- 右侧内容区 -->
      <div class="settings-content">
        <!-- 用户管理 -->
        <div v-show="activeTab === 'users'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-user"></i>
                用户管理
              </div>
              <div class="card-actions">
                <el-button type="primary" icon="el-icon-plus" size="small" @click="showUserDialog()">新增用户</el-button>
                <el-button type="success" icon="el-icon-upload2" size="small" @click="importUsers">批量导入</el-button>
                <el-button type="info" icon="el-icon-download" size="small" @click="exportUsers">导出用户</el-button>
              </div>
            </div>

            <!-- 用户搜索 -->
            <div class="search-wrapper">
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-input
                    v-model="userQuery.username"
                    placeholder="用户名/姓名"
                    clearable
                    prefix-icon="el-icon-search"
                    @keyup.enter.native="searchUsers" />
                </el-col>
                <el-col :span="5">
                  <el-select v-model="userQuery.department" placeholder="部门" clearable style="width: 100%">
                    <el-option v-for="dept in departmentList" :key="dept.id" :label="dept.name" :value="dept.id" />
                  </el-select>
                </el-col>
                <el-col :span="5">
                  <el-select v-model="userQuery.role" placeholder="角色" clearable style="width: 100%">
                    <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-select v-model="userQuery.status" placeholder="状态" clearable style="width: 100%">
                    <el-option label="正常" :value="1" />
                    <el-option label="禁用" :value="0" />
                  </el-select>
                </el-col>
                <el-col :span="4">
                  <el-button type="primary" icon="el-icon-search" @click="searchUsers">搜索</el-button>
                  <el-button icon="el-icon-refresh" @click="resetUserQuery">重置</el-button>
                </el-col>
              </el-row>
            </div>

            <!-- 用户表格 -->
            <div class="table-wrapper">
              <el-table v-loading="userLoading" :data="userList" stripe border class="modern-table" @selection-change="handleUserSelection">
                <el-table-column type="selection" width="55" align="center" />
                <el-table-column type="index" label="序号" width="60" align="center" />

                <el-table-column label="用户信息" min-width="200">
                  <template slot-scope="scope">
                    <div class="user-info">
                      <el-avatar :size="40" :src="scope.row.avatar" icon="el-icon-user-solid" />
                      <div class="user-details">
                        <div class="user-name">{{ scope.row.realName }}</div>
                        <div class="user-username">@{{ scope.row.username }}</div>
                      </div>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column prop="phone" label="联系方式" width="140">
                  <template slot-scope="scope">
                    <div class="contact-info">
                      <div class="phone">{{ scope.row.phone }}</div>
                      <div class="email">{{ scope.row.email }}</div>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column prop="department" label="部门" width="120" show-overflow-tooltip />
                <el-table-column prop="position" label="职位" width="100" show-overflow-tooltip />

                <el-table-column label="角色" width="150">
                  <template slot-scope="scope">
                    <el-tag
                      v-for="role in scope.row.roles"
                      :key="role.id"
                      size="mini"
                      type="primary"
                      effect="plain"
                      style="margin-right: 4px; margin-bottom: 2px">
                      {{ role.name }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column label="状态" width="80" align="center">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini">
                      {{ scope.row.status === 1 ? '正常' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column label="最后登录" width="140" align="center">
                  <template slot-scope="scope">
                    <div v-if="scope.row.lastLoginTime" class="time-info">
                      <div class="time-date">{{ formatDate(scope.row.lastLoginTime) }}</div>
                      <div class="time-clock">{{ formatTime(scope.row.lastLoginTime) }}</div>
                    </div>
                    <span v-else class="no-data">未登录</span>
                  </template>
                </el-table-column>

                <el-table-column label="操作" width="200" align="center" fixed="right">
                  <template slot-scope="scope">
                    <div class="action-buttons">
                      <el-tooltip content="编辑" placement="top">
                        <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showUserDialog(scope.row)" />
                      </el-tooltip>
                      <el-tooltip content="分配角色" placement="top">
                        <el-button type="success" icon="el-icon-s-check" size="mini" circle @click="assignUserRoles(scope.row)" />
                      </el-tooltip>
                      <el-tooltip content="重置密码" placement="top">
                        <el-button type="warning" icon="el-icon-key" size="mini" circle @click="resetPassword(scope.row)" />
                      </el-tooltip>
                      <el-tooltip :content="scope.row.status === 1 ? '禁用' : '启用'" placement="top">
                        <el-button
                          :type="scope.row.status === 1 ? 'danger' : 'success'"
                          :icon="scope.row.status === 1 ? 'el-icon-close' : 'el-icon-check'"
                          size="mini"
                          circle
                          @click="toggleUserStatus(scope.row)" />
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 批量操作 -->
              <div v-if="selectedUsers.length > 0" class="batch-actions">
                <span class="batch-info">已选择 {{ selectedUsers.length }} 个用户</span>
                <el-button type="primary" icon="el-icon-s-check" size="small" @click="batchAssignRoles">批量分配角色</el-button>
                <el-button type="warning" icon="el-icon-close" size="small" @click="batchDisableUsers">批量禁用</el-button>
                <el-button type="danger" icon="el-icon-delete" size="small" @click="batchDeleteUsers">批量删除</el-button>
              </div>

              <!-- 分页 -->
              <div class="pagination-wrapper">
                <el-pagination
                  :current-page="userPagination.page"
                  :page-sizes="[10, 20, 50, 100]"
                  :page-size="userPagination.size"
                  :total="userPagination.total"
                  layout="total, sizes, prev, pager, next, jumper"
                  @size-change="handleUserSizeChange"
                  @current-change="handleUserPageChange"
                  background />
              </div>
            </div>
          </el-card>
        </div>

        <!-- 角色管理 -->
        <div v-show="activeTab === 'roles'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-s-check"></i>
                角色管理
              </div>
              <div class="card-actions">
                <el-button type="primary" icon="el-icon-plus" size="small" @click="showRoleDialog()">新增角色</el-button>
              </div>
            </div>

            <!-- 角色列表 -->
            <div class="role-grid">
              <div v-for="role in roleList" :key="role.id" class="role-card" @click="viewRoleDetail(role)">
                <div class="role-header">
                  <div class="role-info">
                    <div class="role-name">{{ role.name }}</div>
                    <div class="role-code">{{ role.code }}</div>
                  </div>
                  <div class="role-actions">
                    <el-dropdown @command="handleRoleAction" trigger="click">
                      <el-button type="text" icon="el-icon-more" />
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item :command="{ action: 'edit', role: role }" icon="el-icon-edit">编辑</el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'permission', role: role }" icon="el-icon-lock">权限设置</el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'copy', role: role }" icon="el-icon-document-copy">复制角色</el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'delete', role: role }" icon="el-icon-delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </div>
                <div class="role-description">{{ role.description || '暂无描述' }}</div>
                <div class="role-stats">
                  <div class="stat-item">
                    <span class="stat-number">{{ role.userCount || 0 }}</span>
                    <span class="stat-label">用户数</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ role.permissionCount || 0 }}</span>
                    <span class="stat-label">权限数</span>
                  </div>
                </div>
                <div class="role-footer">
                  <el-tag :type="role.status === 1 ? 'success' : 'danger'" size="mini">
                    {{ role.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                  <span class="role-created">{{ formatDate(role.createTime) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 权限管理 -->
        <div v-show="activeTab === 'permissions'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-lock"></i>
                权限管理
              </div>
              <div class="card-actions">
                <el-button type="primary" icon="el-icon-plus" size="small" @click="showPermissionDialog()">新增权限</el-button>
                <el-button type="success" icon="el-icon-refresh" size="small" @click="syncPermissions">同步权限</el-button>
              </div>
            </div>

            <!-- 权限树 -->
            <div class="permission-tree-wrapper">
              <el-tree
                ref="permissionTree"
                :data="permissionTree"
                :props="treeProps"
                :default-expand-all="false"
                :expand-on-click-node="false"
                show-checkbox
                node-key="id"
                class="permission-tree">
                <div slot-scope="{ node, data }" class="tree-node">
                  <div class="node-content">
                    <i :class="getPermissionIcon(data.type)" class="node-icon"></i>
                    <span class="node-label">{{ data.name }}</span>
                    <el-tag v-if="data.code" type="info" size="mini" effect="plain">{{ data.code }}</el-tag>
                  </div>
                  <div class="node-actions">
                    <el-button type="text" icon="el-icon-plus" size="mini" @click="addChildPermission(data)">添加子权限</el-button>
                    <el-button type="text" icon="el-icon-edit" size="mini" @click="editPermission(data)">编辑</el-button>
                    <el-button type="text" icon="el-icon-delete" size="mini" @click="deletePermission(data)">删除</el-button>
                  </div>
                </div>
              </el-tree>
            </div>
          </el-card>
        </div>

        <!-- 部门管理 -->
        <div v-show="activeTab === 'departments'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-office-building"></i>
                部门管理
              </div>
              <div class="card-actions">
                <el-button type="primary" icon="el-icon-plus" size="small" @click="showDepartmentDialog()">新增部门</el-button>
              </div>
            </div>

            <!-- 部门树形结构 -->
            <div class="department-tree-wrapper">
              <el-tree
                :data="departmentTree"
                :props="treeProps"
                :default-expand-all="true"
                :expand-on-click-node="false"
                node-key="id"
                class="department-tree">
                <div slot-scope="{ node, data }" class="tree-node">
                  <div class="node-content">
                    <i class="el-icon-office-building node-icon"></i>
                    <span class="node-label">{{ data.name }}</span>
                    <el-tag type="primary" size="mini" effect="plain">{{ data.userCount || 0 }}人</el-tag>
                  </div>
                  <div class="node-actions">
                    <el-button type="text" icon="el-icon-plus" size="mini" @click="addChildDepartment(data)">添加子部门</el-button>
                    <el-button type="text" icon="el-icon-edit" size="mini" @click="editDepartment(data)">编辑</el-button>
                    <el-button type="text" icon="el-icon-view" size="mini" @click="viewDepartmentUsers(data)">查看人员</el-button>
                    <el-button type="text" icon="el-icon-delete" size="mini" @click="deleteDepartment(data)">删除</el-button>
                  </div>
                </div>
              </el-tree>
            </div>
          </el-card>
        </div>

        <!-- 职位管理 -->
        <div v-show="activeTab === 'positions'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-postcard"></i>
                职位管理
              </div>
              <div class="card-actions">
                <el-button type="primary" icon="el-icon-plus" size="small" @click="showPositionDialog()">新增职位</el-button>
              </div>
            </div>

            <!-- 职位表格 -->
            <div class="table-wrapper">
              <el-table v-loading="positionLoading" :data="positionList" stripe border class="modern-table">
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column prop="name" label="职位名称" min-width="150" />
                <el-table-column prop="code" label="职位编码" width="120" />
                <el-table-column prop="level" label="职位级别" width="100" align="center">
                  <template slot-scope="scope">
                    <el-tag :type="getLevelType(scope.row.level)" size="mini">
                      {{ getLevelText(scope.row.level) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="department" label="所属部门" width="120" />
                <el-table-column prop="userCount" label="在职人数" width="100" align="center" />
                <el-table-column prop="description" label="职位描述" min-width="200" show-overflow-tooltip />
                <el-table-column label="状态" width="80" align="center">
                  <template slot-scope="scope">
                    <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'" size="mini">
                      {{ scope.row.status === 1 ? '启用' : '禁用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="150" align="center" fixed="right">
                  <template slot-scope="scope">
                    <div class="action-buttons">
                      <el-tooltip content="编辑" placement="top">
                        <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showPositionDialog(scope.row)" />
                      </el-tooltip>
                      <el-tooltip :content="scope.row.status === 1 ? '禁用' : '启用'" placement="top">
                        <el-button
                          :type="scope.row.status === 1 ? 'danger' : 'success'"
                          :icon="scope.row.status === 1 ? 'el-icon-close' : 'el-icon-check'"
                          size="mini"
                          circle
                          @click="togglePositionStatus(scope.row)" />
                      </el-tooltip>
                      <el-tooltip content="删除" placement="top">
                        <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="deletePosition(scope.row)" />
                      </el-tooltip>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>
        </div>

        <!-- 用户组管理 -->
        <div v-show="activeTab === 'groups'" class="setting-panel">
          <el-card class="setting-card" shadow="never">
            <div slot="header" class="card-header">
              <div class="card-title">
                <i class="el-icon-s-custom"></i>
                用户组管理
              </div>
              <div class="card-actions">
                <el-button type="primary" icon="el-icon-plus" size="small" @click="showGroupDialog()">新增用户组</el-button>
              </div>
            </div>

            <!-- 用户组网格 -->
            <div class="group-grid">
              <div v-for="group in groupList" :key="group.id" class="group-card">
                <div class="group-header">
                  <div class="group-info">
                    <div class="group-name">{{ group.name }}</div>
                    <div class="group-type">{{ group.type }}</div>
                  </div>
                  <div class="group-actions">
                    <el-dropdown @command="handleGroupAction" trigger="click">
                      <el-button type="text" icon="el-icon-more" />
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item :command="{ action: 'edit', group: group }" icon="el-icon-edit">编辑</el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'members', group: group }" icon="el-icon-user">管理成员</el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'permissions', group: group }" icon="el-icon-lock">权限设置</el-dropdown-item>
                        <el-dropdown-item :command="{ action: 'delete', group: group }" icon="el-icon-delete" divided>删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </div>
                </div>
                <div class="group-description">{{ group.description || '暂无描述' }}</div>
                <div class="group-members">
                  <div class="member-avatars">
                    <el-avatar
                      v-for="member in group.members.slice(0, 5)"
                      :key="member.id"
                      :size="24"
                      :src="member.avatar"
                      :title="member.name"
                      icon="el-icon-user-solid" />
                    <span v-if="group.members.length > 5" class="more-count">+{{ group.members.length - 5 }}</span>
                  </div>
                  <div class="member-count">{{ group.members.length }} 名成员</div>
                </div>
                <div class="group-footer">
                  <el-tag :type="group.status === 1 ? 'success' : 'danger'" size="mini">
                    {{ group.status === 1 ? '启用' : '禁用' }}
                  </el-tag>
                  <span class="group-created">{{ formatDate(group.createTime) }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </div>
      </div>
    </div>

    <!-- 用户弹窗 -->
    <el-dialog
      :title="userDialog.isEdit ? '编辑用户' : '新增用户'"
      :visible.sync="userDialog.visible"
      width="800px"
      :close-on-click-modal="false"
      @close="handleUserDialogClose"
      class="modern-dialog">
      <el-form ref="userFormRef" :model="userForm" :rules="userFormRules" label-width="100px" class="modern-form">
        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="userForm.username" placeholder="请输入用户名" :disabled="userDialog.isEdit">
                <template slot="prefix">
                  <i class="el-icon-user"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="真实姓名" prop="realName">
              <el-input v-model="userForm.realName" placeholder="请输入真实姓名">
                <template slot="prefix">
                  <i class="el-icon-user-solid"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24" v-if="!userDialog.isEdit">
          <el-col :span="12">
            <el-form-item label="密码" prop="password">
              <el-input v-model="userForm.password" type="password" placeholder="请输入密码" show-password>
                <template slot="prefix">
                  <i class="el-icon-lock"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="确认密码" prop="confirmPassword">
              <el-input v-model="userForm.confirmPassword" type="password" placeholder="请确认密码" show-password>
                <template slot="prefix">
                  <i class="el-icon-lock"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="手机号码" prop="phone">
              <el-input v-model="userForm.phone" placeholder="请输入手机号码">
                <template slot="prefix">
                  <i class="el-icon-phone"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱地址" prop="email">
              <el-input v-model="userForm.email" placeholder="请输入邮箱地址">
                <template slot="prefix">
                  <i class="el-icon-message"></i>
                </template>
              </el-input>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="所属部门" prop="departmentId">
              <el-cascader
                v-model="userForm.departmentId"
                :options="departmentOptions"
                :props="cascaderProps"
                placeholder="请选择部门"
                clearable
                style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="职位" prop="positionId">
              <el-select v-model="userForm.positionId" placeholder="请选择职位" style="width: 100%">
                <el-option v-for="position in positionList" :key="position.id" :label="position.name" :value="position.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="12">
            <el-form-item label="用户角色" prop="roleIds">
              <el-select v-model="userForm.roleIds" multiple placeholder="请选择角色" style="width: 100%">
                <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="userForm.status">
                <el-radio :label="1">正常</el-radio>
                <el-radio :label="0">禁用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="24">
          <el-col :span="24">
            <el-form-item label="备注">
              <el-input v-model="userForm.remark" type="textarea" :rows="3" placeholder="请输入备注信息..." maxlength="200" show-word-limit />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="userDialog.visible = false" icon="el-icon-close">取消</el-button>
        <el-button @click="resetUserForm" icon="el-icon-refresh">重置</el-button>
        <el-button type="primary" :loading="userDialog.loading" @click="handleUserSave" icon="el-icon-check">
          {{ userDialog.isEdit ? '更新' : '创建' }}
        </el-button>
      </div>
    </el-dialog>

    <!-- 角色分配弹窗 -->
    <el-dialog title="分配角色" :visible.sync="roleAssignDialog.visible" width="600px" :close-on-click-modal="false" class="modern-dialog">
      <div class="role-assign-content">
        <div class="user-info">
          <el-avatar :size="50" :src="roleAssignDialog.user.avatar" icon="el-icon-user-solid" />
          <div class="user-details">
            <div class="user-name">{{ roleAssignDialog.user.realName }}</div>
            <div class="user-username">@{{ roleAssignDialog.user.username }}</div>
          </div>
        </div>

        <el-divider />

        <div class="role-selection">
          <h4>选择角色</h4>
          <el-checkbox-group v-model="roleAssignDialog.selectedRoles">
            <el-row :gutter="16">
              <el-col v-for="role in roleList" :key="role.id" :span="12">
                <el-checkbox :label="role.id" class="role-checkbox">
                  <div class="role-item">
                    <div class="role-name">{{ role.name }}</div>
                    <div class="role-description">{{ role.description }}</div>
                  </div>
                </el-checkbox>
              </el-col>
            </el-row>
          </el-checkbox-group>
        </div>
      </div>

      <div slot="footer" class="dialog-footer">
        <el-button @click="roleAssignDialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="roleAssignDialog.loading" @click="handleRoleAssign">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UserSettings',
  data() {
    return {
      // 当前活动的标签页
      activeTab: 'users',

      // 统计数据
      totalUsers: 156,
      onlineUsers: 23,
      totalRoles: 8,

      // 用户管理相关
      userLoading: false,
      userList: [],
      selectedUsers: [],
      userQuery: {
        username: '',
        department: '',
        role: '',
        status: null
      },
      userPagination: {
        page: 1,
        size: 20,
        total: 0
      },

      // 角色管理相关
      roleList: [],

      // 权限管理相关
      permissionTree: [],
      treeProps: {
        children: 'children',
        label: 'name'
      },

      // 部门管理相关
      departmentTree: [],
      departmentList: [],
      departmentOptions: [],
      cascaderProps: {
        value: 'id',
        label: 'name',
        children: 'children',
        checkStrictly: true
      },

      // 职位管理相关
      positionLoading: false,
      positionList: [],

      // 用户组管理相关
      groupList: [],

      // 用户弹窗
      userDialog: {
        visible: false,
        isEdit: false,
        loading: false
      },
      userForm: {
        username: '',
        realName: '',
        password: '',
        confirmPassword: '',
        phone: '',
        email: '',
        departmentId: null,
        positionId: null,
        roleIds: [],
        status: 1,
        remark: ''
      },
      userFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: this.validateConfirmPassword, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱地址', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ],
        departmentId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
        roleIds: [{ required: true, message: '请选择用户角色', trigger: 'change' }]
      },

      // 角色分配弹窗
      roleAssignDialog: {
        visible: false,
        loading: false,
        user: {},
        selectedRoles: []
      }
    }
  },

  created() {
    this.loadInitialData()
  },

  methods: {
    // 加载初始数据
    async loadInitialData() {
      await Promise.all([this.loadUsers(), this.loadRoles(), this.loadPermissions(), this.loadDepartments(), this.loadPositions(), this.loadGroups()])
    },

    // 切换标签页
    handleTabChange(key) {
      this.activeTab = key
    },

    // 加载用户列表
    async loadUsers() {
      this.userLoading = true
      try {
        // TODO: 调用API获取用户列表
        // 模拟数据
        this.userList = [
          {
            id: 1,
            username: 'admin',
            realName: '系统管理员',
            phone: '13800138000',
            email: 'admin@example.com',
            department: '信息技术部',
            position: '系统管理员',
            roles: [{ id: 1, name: '超级管理员' }],
            status: 1,
            lastLoginTime: new Date(),
            avatar: ''
          },
          {
            id: 2,
            username: 'user001',
            realName: '张三',
            phone: '13800138001',
            email: 'zhangsan@example.com',
            department: '生产部',
            position: '生产主管',
            roles: [{ id: 2, name: '生产管理员' }],
            status: 1,
            lastLoginTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
            avatar: ''
          }
        ]
        this.userPagination.total = this.userList.length
      } catch (error) {
        this.$message.error('加载用户列表失败')
      } finally {
        this.userLoading = false
      }
    },

    // 加载角色列表
    async loadRoles() {
      try {
        // TODO: 调用API获取角色列表
        this.roleList = [
          {
            id: 1,
            name: '超级管理员',
            code: 'SUPER_ADMIN',
            description: '系统超级管理员，拥有所有权限',
            userCount: 1,
            permissionCount: 50,
            status: 1,
            createTime: new Date()
          },
          {
            id: 2,
            name: '生产管理员',
            code: 'PRODUCTION_ADMIN',
            description: '生产管理员，负责生产相关功能',
            userCount: 5,
            permissionCount: 25,
            status: 1,
            createTime: new Date()
          }
        ]
      } catch (error) {
        this.$message.error('加载角色列表失败')
      }
    },

    // 加载权限树
    async loadPermissions() {
      try {
        // TODO: 调用API获取权限树
        this.permissionTree = [
          {
            id: 1,
            name: '系统管理',
            code: 'SYSTEM',
            type: 'module',
            children: [
              {
                id: 11,
                name: '用户管理',
                code: 'USER_MANAGE',
                type: 'menu',
                children: [
                  { id: 111, name: '查看用户', code: 'USER_VIEW', type: 'button' },
                  { id: 112, name: '新增用户', code: 'USER_ADD', type: 'button' },
                  { id: 113, name: '编辑用户', code: 'USER_EDIT', type: 'button' },
                  { id: 114, name: '删除用户', code: 'USER_DELETE', type: 'button' }
                ]
              }
            ]
          }
        ]
      } catch (error) {
        this.$message.error('加载权限树失败')
      }
    },

    // 加载部门树
    async loadDepartments() {
      try {
        // TODO: 调用API获取部门树
        const departments = [
          {
            id: 1,
            name: '总公司',
            userCount: 20,
            children: [
              {
                id: 11,
                name: '信息技术部',
                userCount: 8,
                children: [
                  { id: 111, name: '开发组', userCount: 5 },
                  { id: 112, name: '运维组', userCount: 3 }
                ]
              },
              {
                id: 12,
                name: '生产部',
                userCount: 12,
                children: [
                  { id: 121, name: '车间一', userCount: 6 },
                  { id: 122, name: '车间二', userCount: 6 }
                ]
              }
            ]
          }
        ]

        this.departmentTree = departments
        this.departmentList = this.flattenDepartments(departments)
        this.departmentOptions = departments
      } catch (error) {
        this.$message.error('加载部门信息失败')
      }
    },

    // 扁平化部门数据
    flattenDepartments(departments, result = []) {
      departments.forEach((dept) => {
        result.push(dept)
        if (dept.children && dept.children.length > 0) {
          this.flattenDepartments(dept.children, result)
        }
      })
      return result
    },

    // 加载职位列表
    async loadPositions() {
      this.positionLoading = true
      try {
        // TODO: 调用API获取职位列表
        this.positionList = [
          {
            id: 1,
            name: '系统管理员',
            code: 'SYS_ADMIN',
            level: 1,
            department: '信息技术部',
            userCount: 1,
            description: '负责系统的日常维护和管理',
            status: 1
          },
          {
            id: 2,
            name: '生产主管',
            code: 'PROD_SUPERVISOR',
            level: 2,
            department: '生产部',
            userCount: 2,
            description: '负责生产线的管理和协调',
            status: 1
          }
        ]
      } catch (error) {
        this.$message.error('加载职位列表失败')
      } finally {
        this.positionLoading = false
      }
    },

    // 加载用户组列表
    async loadGroups() {
      try {
        // TODO: 调用API获取用户组列表
        this.groupList = [
          {
            id: 1,
            name: '管理组',
            type: '管理',
            description: '系统管理人员组',
            members: [
              { id: 1, name: '张三', avatar: '' },
              { id: 2, name: '李四', avatar: '' }
            ],
            status: 1,
            createTime: new Date()
          }
        ]
      } catch (error) {
        this.$message.error('加载用户组列表失败')
      }
    },

    // 搜索用户
    searchUsers() {
      this.userPagination.page = 1
      this.loadUsers()
    },

    // 重置用户查询
    resetUserQuery() {
      this.userQuery = {
        username: '',
        department: '',
        role: '',
        status: null
      }
      this.searchUsers()
    },

    // 用户表格选择变化
    handleUserSelection(selection) {
      this.selectedUsers = selection
    },

    // 用户分页大小变化
    handleUserSizeChange(size) {
      this.userPagination.size = size
      this.loadUsers()
    },

    // 用户页码变化
    handleUserPageChange(page) {
      this.userPagination.page = page
      this.loadUsers()
    },

    // 显示用户弹窗
    showUserDialog(user = null) {
      this.userDialog.isEdit = !!user
      this.userDialog.visible = true

      if (user) {
        this.userForm = { ...user }
      } else {
        this.resetUserForm()
      }
    },

    // 重置用户表单
    resetUserForm() {
      this.userForm = {
        username: '',
        realName: '',
        password: '',
        confirmPassword: '',
        phone: '',
        email: '',
        departmentId: null,
        positionId: null,
        roleIds: [],
        status: 1,
        remark: ''
      }
      this.$nextTick(() => {
        this.$refs.userFormRef && this.$refs.userFormRef.clearValidate()
      })
    },

    // 用户弹窗关闭
    handleUserDialogClose() {
      this.resetUserForm()
    },

    // 保存用户
    async handleUserSave() {
      try {
        await this.$refs.userFormRef.validate()
        this.userDialog.loading = true

        // TODO: 调用API保存用户
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.$message.success(this.userDialog.isEdit ? '用户更新成功' : '用户创建成功')
        this.userDialog.visible = false
        this.loadUsers()
      } catch (error) {
        this.$message.error('操作失败')
      } finally {
        this.userDialog.loading = false
      }
    },

    // 分配用户角色
    assignUserRoles(user) {
      this.roleAssignDialog.user = user
      this.roleAssignDialog.selectedRoles = user.roles.map((role) => role.id)
      this.roleAssignDialog.visible = true
    },

    // 处理角色分配
    async handleRoleAssign() {
      this.roleAssignDialog.loading = true
      try {
        // TODO: 调用API分配角色
        await new Promise((resolve) => setTimeout(resolve, 1000))

        this.$message.success('角色分配成功')
        this.roleAssignDialog.visible = false
        this.loadUsers()
      } catch (error) {
        this.$message.error('角色分配失败')
      } finally {
        this.roleAssignDialog.loading = false
      }
    },

    // 重置密码
    async resetPassword(user) {
      try {
        await this.$confirm(`确认重置用户"${user.realName}"的密码吗？`, '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API重置密码
        this.$message.success('密码重置成功，新密码已发送至用户邮箱')
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('密码重置失败')
        }
      }
    },

    // 切换用户状态
    async toggleUserStatus(user) {
      try {
        const action = user.status === 1 ? '禁用' : '启用'
        await this.$confirm(`确认${action}用户"${user.realName}"吗？`, '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API切换状态
        user.status = user.status === 1 ? 0 : 1
        this.$message.success(`用户${action}成功`)
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('操作失败')
        }
      }
    },

    // 批量分配角色
    batchAssignRoles() {
      this.$message.info('批量分配角色功能开发中...')
    },

    // 批量禁用用户
    async batchDisableUsers() {
      try {
        await this.$confirm(`确认禁用选中的 ${this.selectedUsers.length} 个用户吗？`, '批量禁用确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API批量禁用
        this.$message.success('批量禁用成功')
        this.loadUsers()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量禁用失败')
        }
      }
    },

    // 批量删除用户
    async batchDeleteUsers() {
      try {
        await this.$confirm(`确认删除选中的 ${this.selectedUsers.length} 个用户吗？`, '批量删除确认', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API批量删除
        this.$message.success('批量删除成功')
        this.loadUsers()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('批量删除失败')
        }
      }
    },

    // 导入用户
    importUsers() {
      this.$message.info('批量导入功能开发中...')
    },

    // 导出用户
    exportUsers() {
      this.$message.info('导出用户功能开发中...')
    },

    // 查看角色详情
    viewRoleDetail(role) {
      this.$message.info(`查看角色详情: ${role.name}`)
    },

    // 显示角色弹窗
    showRoleDialog(role = null) {
      this.$message.info('角色编辑功能开发中...')
    },

    // 处理角色操作
    handleRoleAction(command) {
      const { action, role } = command
      switch (action) {
        case 'edit':
          this.showRoleDialog(role)
          break
        case 'permission':
          this.$message.info(`设置角色"${role.name}"的权限`)
          break
        case 'copy':
          this.$message.info(`复制角色"${role.name}"`)
          break
        case 'delete':
          this.deleteRole(role)
          break
      }
    },

    // 删除角色
    async deleteRole(role) {
      try {
        await this.$confirm(`确认删除角色"${role.name}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API删除角色
        this.$message.success('角色删除成功')
        this.loadRoles()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('角色删除失败')
        }
      }
    },

    // 显示权限弹窗
    showPermissionDialog(permission = null) {
      this.$message.info('权限编辑功能开发中...')
    },

    // 添加子权限
    addChildPermission(permission) {
      this.$message.info(`为"${permission.name}"添加子权限`)
    },

    // 编辑权限
    editPermission(permission) {
      this.showPermissionDialog(permission)
    },

    // 删除权限
    async deletePermission(permission) {
      try {
        await this.$confirm(`确认删除权限"${permission.name}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API删除权限
        this.$message.success('权限删除成功')
        this.loadPermissions()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('权限删除失败')
        }
      }
    },

    // 同步权限
    async syncPermissions() {
      try {
        // TODO: 调用API同步权限
        this.$message.success('权限同步成功')
        this.loadPermissions()
      } catch (error) {
        this.$message.error('权限同步失败')
      }
    },

    // 获取权限图标
    getPermissionIcon(type) {
      const iconMap = {
        module: 'el-icon-menu',
        menu: 'el-icon-document',
        button: 'el-icon-button'
      }
      return iconMap[type] || 'el-icon-setting'
    },

    // 显示部门弹窗
    showDepartmentDialog(department = null) {
      this.$message.info('部门编辑功能开发中...')
    },

    // 添加子部门
    addChildDepartment(department) {
      this.$message.info(`为"${department.name}"添加子部门`)
    },

    // 编辑部门
    editDepartment(department) {
      this.showDepartmentDialog(department)
    },

    // 查看部门人员
    viewDepartmentUsers(department) {
      this.$message.info(`查看"${department.name}"的人员`)
    },

    // 删除部门
    async deleteDepartment(department) {
      try {
        await this.$confirm(`确认删除部门"${department.name}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API删除部门
        this.$message.success('部门删除成功')
        this.loadDepartments()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('部门删除失败')
        }
      }
    },

    // 显示职位弹窗
    showPositionDialog(position = null) {
      this.$message.info('职位编辑功能开发中...')
    },

    // 切换职位状态
    async togglePositionStatus(position) {
      try {
        const action = position.status === 1 ? '禁用' : '启用'
        await this.$confirm(`确认${action}职位"${position.name}"吗？`, '确认操作', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API切换状态
        position.status = position.status === 1 ? 0 : 1
        this.$message.success(`职位${action}成功`)
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('操作失败')
        }
      }
    },

    // 删除职位
    async deletePosition(position) {
      try {
        await this.$confirm(`确认删除职位"${position.name}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API删除职位
        this.$message.success('职位删除成功')
        this.loadPositions()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('职位删除失败')
        }
      }
    },

    // 获取级别类型
    getLevelType(level) {
      const typeMap = {
        1: 'danger',
        2: 'warning',
        3: 'primary',
        4: 'success',
        5: 'info'
      }
      return typeMap[level] || 'info'
    },

    // 获取级别文本
    getLevelText(level) {
      const textMap = {
        1: '高级',
        2: '中级',
        3: '初级',
        4: '实习',
        5: '其他'
      }
      return textMap[level] || '未知'
    },

    // 显示用户组弹窗
    showGroupDialog(group = null) {
      this.$message.info('用户组编辑功能开发中...')
    },

    // 处理用户组操作
    handleGroupAction(command) {
      const { action, group } = command
      switch (action) {
        case 'edit':
          this.showGroupDialog(group)
          break
        case 'members':
          this.$message.info(`管理用户组"${group.name}"的成员`)
          break
        case 'permissions':
          this.$message.info(`设置用户组"${group.name}"的权限`)
          break
        case 'delete':
          this.deleteGroup(group)
          break
      }
    },

    // 删除用户组
    async deleteGroup(group) {
      try {
        await this.$confirm(`确认删除用户组"${group.name}"吗？`, '确认删除', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })

        // TODO: 调用API删除用户组
        this.$message.success('用户组删除成功')
        this.loadGroups()
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('用户组删除失败')
        }
      }
    },

    // 确认密码验证
    validateConfirmPassword(rule, value, callback) {
      if (value !== this.userForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    },

    // 格式化日期
    formatDate(date) {
      return new Date(date).toLocaleDateString('zh-CN')
    },

    // 格式化时间
    formatTime(date) {
      return new Date(date).toLocaleTimeString('zh-CN', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.user-settings {
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

    .header-stats {
      display: flex;
      gap: 32px;

      .stat-item {
        text-align: center;

        .stat-number {
          display: block;
          font-size: 32px;
          font-weight: 700;
          line-height: 1;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 14px;
          opacity: 0.8;
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
            justify-content: space-between;
            align-items: center;

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

            .card-actions {
              display: flex;
              gap: 8px;

              .el-button {
                border-radius: 6px;
                font-weight: 500;
              }
            }
          }

          // 搜索区域
          .search-wrapper {
            margin: 20px 0;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
          }

          // 表格样式
          .table-wrapper {
            .modern-table {
              border-radius: 8px;
              overflow: hidden;
              border: 1px solid #ebeef5;

              // 用户信息单元格
              .user-info {
                display: flex;
                align-items: center;
                gap: 12px;

                .user-details {
                  .user-name {
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 2px;
                  }

                  .user-username {
                    font-size: 12px;
                    color: #909399;
                  }
                }
              }

              // 联系信息单元格
              .contact-info {
                .phone {
                  font-size: 13px;
                  color: #303133;
                  margin-bottom: 2px;
                }

                .email {
                  font-size: 12px;
                  color: #909399;
                }
              }

              // 时间信息
              .time-info {
                .time-date {
                  font-size: 13px;
                  color: #303133;
                  margin-bottom: 2px;
                }

                .time-clock {
                  font-size: 12px;
                  color: #909399;
                }
              }

              .no-data {
                color: #c0c4cc;
                font-size: 12px;
              }

              // 操作按钮
              .action-buttons {
                display: flex;
                gap: 6px;
                justify-content: center;

                .el-button.is-circle {
                  width: 28px;
                  height: 28px;
                  padding: 0;
                  transition: all 0.3s ease;

                  &:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                  }
                }
              }
            }

            // 批量操作
            .batch-actions {
              margin-top: 16px;
              padding: 16px;
              background: #f0f9ff;
              border: 1px solid #b3d8ff;
              border-radius: 8px;
              display: flex;
              align-items: center;
              gap: 12px;

              .batch-info {
                color: #409eff;
                font-weight: 500;
                margin-right: 8px;
              }
            }

            // 分页
            .pagination-wrapper {
              margin-top: 20px;
              display: flex;
              justify-content: flex-end;
              padding: 20px 0 0 0;
              border-top: 1px solid #ebeef5;
            }
          }

          // 角色网格
          .role-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;

            .role-card {
              background: white;
              border: 1px solid #ebeef5;
              border-radius: 12px;
              padding: 20px;
              cursor: pointer;
              transition: all 0.3s ease;

              &:hover {
                border-color: #409eff;
                box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
                transform: translateY(-2px);
              }

              .role-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;

                .role-info {
                  .role-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 4px;
                  }

                  .role-code {
                    font-size: 12px;
                    color: #909399;
                    font-family: 'Monaco', 'Menlo', monospace;
                  }
                }

                .role-actions {
                  .el-button {
                    border: none;
                    background: none;
                    color: #909399;

                    &:hover {
                      color: #409eff;
                    }
                  }
                }
              }

              .role-description {
                color: #606266;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 16px;
                min-height: 42px;
              }

              .role-stats {
                display: flex;
                gap: 24px;
                margin-bottom: 16px;

                .stat-item {
                  text-align: center;

                  .stat-number {
                    display: block;
                    font-size: 20px;
                    font-weight: 600;
                    color: #409eff;
                    line-height: 1;
                  }

                  .stat-label {
                    font-size: 12px;
                    color: #909399;
                    margin-top: 2px;
                  }
                }
              }

              .role-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 12px;
                border-top: 1px solid #f0f0f0;

                .role-created {
                  font-size: 12px;
                  color: #c0c4cc;
                }
              }
            }
          }

          // 权限树
          .permission-tree-wrapper {
            margin-top: 20px;

            .permission-tree {
              border: 1px solid #ebeef5;
              border-radius: 8px;

              .tree-node {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                padding: 8px 12px;

                .node-content {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  flex: 1;

                  .node-icon {
                    color: #409eff;
                    font-size: 16px;
                  }

                  .node-label {
                    font-weight: 500;
                    color: #303133;
                  }
                }

                .node-actions {
                  display: flex;
                  gap: 4px;
                  opacity: 0;
                  transition: opacity 0.3s ease;

                  .el-button {
                    padding: 4px 8px;
                    font-size: 12px;
                  }
                }

                &:hover .node-actions {
                  opacity: 1;
                }
              }
            }
          }

          // 部门树
          .department-tree-wrapper {
            margin-top: 20px;

            .department-tree {
              border: 1px solid #ebeef5;
              border-radius: 8px;

              .tree-node {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 100%;
                padding: 8px 12px;

                .node-content {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  flex: 1;

                  .node-icon {
                    color: #e6a23c;
                    font-size: 16px;
                  }

                  .node-label {
                    font-weight: 500;
                    color: #303133;
                  }
                }

                .node-actions {
                  display: flex;
                  gap: 4px;
                  opacity: 0;
                  transition: opacity 0.3s ease;

                  .el-button {
                    padding: 4px 8px;
                    font-size: 12px;
                  }
                }

                &:hover .node-actions {
                  opacity: 1;
                }
              }
            }
          }

          // 用户组网格
          .group-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;

            .group-card {
              background: white;
              border: 1px solid #ebeef5;
              border-radius: 12px;
              padding: 20px;
              transition: all 0.3s ease;

              &:hover {
                border-color: #409eff;
                box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
              }

              .group-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 12px;

                .group-info {
                  .group-name {
                    font-size: 16px;
                    font-weight: 600;
                    color: #303133;
                    margin-bottom: 4px;
                  }

                  .group-type {
                    font-size: 12px;
                    color: #909399;
                  }
                }

                .group-actions {
                  .el-button {
                    border: none;
                    background: none;
                    color: #909399;

                    &:hover {
                      color: #409eff;
                    }
                  }
                }
              }

              .group-description {
                color: #606266;
                font-size: 14px;
                line-height: 1.5;
                margin-bottom: 16px;
                min-height: 42px;
              }

              .group-members {
                margin-bottom: 16px;

                .member-avatars {
                  display: flex;
                  align-items: center;
                  gap: 4px;
                  margin-bottom: 8px;

                  .el-avatar {
                    border: 2px solid white;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }

                  .more-count {
                    font-size: 12px;
                    color: #909399;
                    margin-left: 4px;
                  }
                }

                .member-count {
                  font-size: 12px;
                  color: #909399;
                }
              }

              .group-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 12px;
                border-top: 1px solid #f0f0f0;

                .group-created {
                  font-size: 12px;
                  color: #c0c4cc;
                }
              }
            }
          }
        }
      }
    }
  }

  // 对话框样式
  .modern-dialog {
    ::v-deep .el-dialog {
      border-radius: 12px;
      overflow: hidden;

      .el-dialog__header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px 24px;

        .el-dialog__title {
          color: white;
          font-weight: 600;
        }

        .el-dialog__close {
          color: white;
          font-size: 18px;

          &:hover {
            color: #f0f0f0;
          }
        }
      }

      .el-dialog__body {
        padding: 24px;
      }
    }

    .modern-form {
      .el-form-item {
        margin-bottom: 20px;

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
      }
    }

    .dialog-footer {
      padding: 20px 24px;
      background: #f8f9fa;
      border-top: 1px solid #ebeef5;
      text-align: right;

      .el-button {
        margin-left: 12px;
        border-radius: 6px;
        padding: 10px 20px;
        font-weight: 500;

        &.el-button--primary {
          background: #409eff;
          border-color: #409eff;

          &:hover {
            background: #3a8ee6;
            border-color: #3a8ee6;
          }
        }
      }
    }

    // 角色分配内容
    .role-assign-content {
      .user-info {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;

        .user-details {
          .user-name {
            font-size: 18px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 4px;
          }

          .user-username {
            font-size: 14px;
            color: #909399;
          }
        }
      }

      .role-selection {
        h4 {
          margin-bottom: 16px;
          color: #303133;
          font-weight: 600;
        }

        .role-checkbox {
          width: 100%;
          margin-bottom: 12px;

          .role-item {
            .role-name {
              font-weight: 500;
              color: #303133;
              margin-bottom: 2px;
            }

            .role-description {
              font-size: 12px;
              color: #909399;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .user-settings {
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

    .role-grid,
    .group-grid {
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)) !important;
    }
  }
}

@media (max-width: 768px) {
  .user-settings {
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

        .header-stats {
          align-self: stretch;
          justify-content: space-around;
          gap: 16px;

          .stat-item {
            .stat-number {
              font-size: 24px;
            }
          }
        }
      }
    }

    .settings-container {
      padding: 0 10px;

      .settings-content {
        .setting-panel {
          .search-wrapper {
            .el-row {
              .el-col {
                width: 100% !important;
                margin-bottom: 12px;
              }
            }
          }

          .table-wrapper {
            overflow-x: auto;

            .modern-table {
              min-width: 800px;
            }
          }

          .role-grid,
          .group-grid {
            grid-template-columns: 1fr !important;
          }
        }
      }
    }

    .modern-dialog {
      ::v-deep .el-dialog {
        width: 95% !important;
        margin: 5vh auto !important;
      }

      .modern-form {
        .el-row {
          .el-col {
            width: 100% !important;
            margin-bottom: 12px;
          }
        }
      }
    }
  }
}
</style>
