# 全部应用功能实现

## 功能概述

"全部应用"按钮现在可以一键保存所有有未保存更改的文件，包括当前活动文件和所有在后台编辑的文件。

## 功能特性

### 1. 智能文件收集
系统会自动收集以下文件进行保存：
- **当前活动文件**：如果有未保存的修改
- **后台编辑文件**：所有在 `fileEditStates` 中标记为已修改的文件

### 2. 并行保存
- 使用 `Promise.all()` 并行保存所有文件，提高效率
- 每个文件独立保存，一个文件失败不会影响其他文件

### 3. 智能按钮状态
- **禁用条件**：
  - 后端未连接
  - 正在加载中
  - 没有未保存的文件 (`unsavedFilesCount === 0`)
- **按钮文本**：
  - 有未保存文件时：`保存全部 (数量)`
  - 没有未保存文件时：`全部应用`

### 4. 键盘快捷键
- **快捷键**：`Ctrl + Shift + S`
- **适用范围**：全局可用（当编辑器有焦点时）

## 技术实现

### saveAllFiles 方法
```typescript
saveAllFiles: async () => {
  // 1. 收集需要保存的文件
  const filesToSave = [];
  
  // 当前活动文件
  if (state.activeFileId && state.isModified) {
    filesToSave.push({
      id: state.activeFileId,
      content: state.activeFileContent
    });
  }
  
  // 后台编辑的文件
  Object.entries(state.fileEditStates).forEach(([fileId, fileState]) => {
    if (fileState.isModified && fileId !== state.activeFileId) {
      filesToSave.push({
        id: fileId,
        content: fileState.content
      });
    }
  });
  
  // 2. 并行保存所有文件
  const results = await Promise.all(
    filesToSave.map(({ id, content }) => 
      apiService.updateFile(id, content)
    )
  );
  
  // 3. 处理保存结果和清理状态
}
```

### 按钮状态管理
```tsx
<button 
  onClick={handleApplyAll}
  disabled={!isConnected || isLoading || unsavedFilesCount === 0}
  title={unsavedFilesCount > 0 ? 
    `保存 ${unsavedFilesCount} 个未保存的文件 (Ctrl+Shift+S)` : 
    '没有需要保存的文件'
  }
>
  <Save size={16} />
  <span>
    {unsavedFilesCount > 0 ? 
      `保存全部 (${unsavedFilesCount})` : 
      '全部应用'
    }
  </span>
</button>
```

### 键盘快捷键
```typescript
// Ctrl+Shift+S 保存全部
if (e.ctrlKey && e.shiftKey && e.key === 'S') {
  e.preventDefault();
  actions.saveAllFiles();
  return;
}
```

## 错误处理

### 1. 部分保存失败
- 显示失败文件的列表
- 成功保存的文件仍会清除编辑状态
- 用户可以重新尝试保存失败的文件

### 2. 没有文件需要保存
- 显示提示信息："没有需要保存的文件"
- 按钮保持禁用状态

### 3. 网络或服务器错误
- 显示通用错误信息
- 保持所有文件的编辑状态不变

## 用户体验

### 1. 视觉反馈
- 按钮显示未保存文件数量
- 提示文本包含键盘快捷键信息
- 加载状态显示

### 2. 状态同步
- 保存成功后立即清除文件的编辑状态
- 状态指示器（黄点）实时更新
- 文件列表刷新显示最新的修改时间

### 3. 效率优化
- 并行保存提高速度
- 智能按钮状态避免无效操作
- 键盘快捷键提高操作效率

这个实现确保了用户可以高效地管理多个配置文件的保存操作，提供了可靠的批量保存功能。