#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 提交必须包含的文件
const REQUIRED_FILES = ['README.md'];
const RECOMMENDED_FILES = ['src/', 'demo.gif', 'screenshot.png'];

// 不允许的文件类型
const DISALLOWED_EXTENSIONS = ['.exe', '.dll', '.so', '.dylib', '.bin'];
const MAX_FILE_COUNT = 50; // 防止提交过多文件

function validateStructure() {
  const submissionsDir = 'submissions';
  
  if (!fs.existsSync(submissionsDir)) {
    console.log('📭 submissions 目录不存在');
    return { valid: true, issues: [] };
  }
  
  const entries = fs.readdirSync(submissionsDir, { withFileTypes: true });
  const submissionDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  
  const allIssues = [];
  
  submissionDirs.forEach(dirName => {
    const dirPath = path.join(submissionsDir, dirName);
    const issues = [];
    
    // 检查目录命名格式
    if (!/^\d{4}-\d{2}-[a-zA-Z0-9_-]+$/.test(dirName)) {
      issues.push(`目录名称格式应为: YYYY-MM-username-project (当前: ${dirName})`);
    }
    
    // 检查必需文件
    REQUIRED_FILES.forEach(file => {
      if (!fs.existsSync(path.join(dirPath, file))) {
        issues.push(`缺少必需文件: ${file}`);
      }
    });
    
    // 检查文件数量
    const countFiles = (dir) => {
      let count = 0;
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          count += countFiles(fullPath);
        } else {
          count++;
        }
      });
      
      return count;
    };
    
    const fileCount = countFiles(dirPath);
    if (fileCount > MAX_FILE_COUNT) {
      issues.push(`文件数量过多: ${fileCount} (建议不超过 ${MAX_FILE_COUNT})`);
    }
    
    // 检查不允许的文件类型
    const checkDisallowed = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          checkDisallowed(fullPath);
        } else {
          const ext = path.extname(entry.name).toLowerCase();
          if (DISALLOWED_EXTENSIONS.includes(ext)) {
            issues.push(`不允许的文件类型: ${entry.name}`);
          }
        }
      });
    };
    
    checkDisallowed(dirPath);
    
    if (issues.length > 0) {
      console.log(`\n📁 ${dirName}:`);
      issues.forEach(issue => console.log(`  ⚠️  ${issue}`));
      allIssues.push({ directory: dirName, issues });
    }
  });
  
  return { valid: allIssues.length === 0, issues: allIssues };
}

if (require.main === module) {
  const result = validateStructure();
  
  if (!result.valid) {
    console.log('\n❌ 结构验证失败，请修复以上问题');
    process.exit(1);
  } else {
    console.log('\n✅ 所有提交结构验证通过');
  }
      }
