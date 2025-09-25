import re

# 读取index.html文件
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 修复字段映射
# 1. 修复表格渲染中的字段名
old_render_pattern = r'row\.innerHTML = `\s*<td>\$\{company\.companyName\}</td>\s*<td>\$\{company\.contact\}</td>\s*<td>\$\{company\.phone\}</td>\s*<td><span class="status-badge \$\{status\.class\}">\$\{status\.text\}</span></td>\s*`;'
new_render_pattern = '''row.innerHTML = `
                    <td>${company.name}</td>
                    <td>${company.contact}</td>
                    <td>${company.phone}</td>
                    <td><span class="status-badge ${status.class}">${status.text}</span></td>
                `;'''

content = re.sub(old_render_pattern, new_render_pattern, content, flags=re.MULTILINE)

# 2. 修复详细信息显示中的字段名
old_detail_pattern = r'document\.getElementById\(\'modalTitle\'\)\.textContent = currentCompany\.companyName;'
new_detail_pattern = "document.getElementById('modalTitle').textContent = currentCompany.name;"
content = re.sub(old_detail_pattern, new_detail_pattern, content)

# 3. 修复详细信息网格中的字段名
old_grid_pattern = r'detailGrid\.innerHTML = `[^`]*`;'
new_grid_pattern = '''detailGrid.innerHTML = `
                <div class="detail-item">
                    <div class="detail-label">企业名称</div>
                    <div class="detail-value">${currentCompany.name}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">联系人</div>
                    <div class="detail-value">${currentCompany.contact}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">联系电话</div>
                    <div class="detail-value">
                        <a href="tel:${currentCompany.phone}" class="phone-link">${currentCompany.phone}</a>
                    </div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">地址</div>
                    <div class="detail-value">${currentCompany.address}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">注册资本</div>
                    <div class="detail-value">${currentCompany.capital}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">经营范围</div>
                    <div class="detail-value">${currentCompany.description}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">企业规模</div>
                    <div class="detail-value">${currentCompany.scale}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">成立日期</div>
                    <div class="detail-value">${currentCompany.registration}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">登记状态</div>
                    <div class="detail-value">${currentCompany.registrationStatus}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">所属省份</div>
                    <div class="detail-value">${currentCompany.province}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">所属城市</div>
                    <div class="detail-value">${currentCompany.city}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">所属区县</div>
                    <div class="detail-value">${currentCompany.district}</div>
                </div>
            `;'''

content = re.sub(old_grid_pattern, new_grid_pattern, content, flags=re.DOTALL)

# 4. 修复搜索功能中的字段名
old_search_pattern = r'company\.companyName\.toLowerCase\(\)\.includes\(searchTerm\)'
new_search_pattern = 'company.name.toLowerCase().includes(searchTerm)'
content = re.sub(old_search_pattern, new_search_pattern, content)

# 5. 修复visitNotes字段名
old_visit_pattern = r'currentCompany\.visitNotes'
new_visit_pattern = 'currentCompany.visitRecord'
content = re.sub(old_visit_pattern, new_visit_pattern, content)

old_visit_pattern2 = r'companies\[index\]\.visitNotes'
new_visit_pattern2 = 'companies[index].visitRecord'
content = re.sub(old_visit_pattern2, new_visit_pattern2, content)

# 写回文件
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("字段映射修复完成！")
