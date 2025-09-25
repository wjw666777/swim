import re

# 读取index.html文件
with open('index.html', 'r', encoding='utf-8') as f:
    html_content = f.read()

# 读取company_data.js文件
with open('company_data.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

# 提取companyData数组
data_match = re.search(r'const companyData = (\[.*?\]);', js_content, re.DOTALL)
if data_match:
    company_data_array = data_match.group(1)
    
    # 在HTML中找到并替换companyData定义
    # 找到现有的companyData定义
    pattern = r'const companyData = \[.*?\];'
    replacement = f'const companyData = {company_data_array};'
    
    # 替换数据
    new_html_content = re.sub(pattern, replacement, html_content, flags=re.DOTALL)
    
    # 写回index.html文件
    with open('index.html', 'w', encoding='utf-8') as f:
        f.write(new_html_content)
    
    print("成功将77条真实企业数据集成到index.html中！")
else:
    print("未能找到companyData数组")
