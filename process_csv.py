#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import csv
import json
import glob
import os

def process_csv_to_json():
    # 查找CSV文件
    csv_files = glob.glob("*.csv")
    if not csv_files:
        print("未找到CSV文件")
        return
    
    csv_file = csv_files[0]
    print(f"处理文件: {csv_file}")
    
    companies = []
    
    try:
        with open(csv_file, 'r', encoding='utf-8') as file:
            reader = csv.reader(file)
            
            for i, row in enumerate(reader, 1):
                if len(row) < 15:  # 确保行有足够的列
                    continue
                    
                # 根据实际CSV结构提取数据
                # 列索引: 0=企业名称, 1=登记状态, 2=法定代表人, 3=注册资本, 4=成立日期, 
                # 5=注册地址, 6=所属省份, 7=所属城市, 8=所属区县, 9=有效手机号, 
                # 10-11=其他电话, 12=企业规模, 13=官网, 14=企业简介
                
                # 提取联系人姓名（从法定代表人字段）
                contact_name = row[2].strip() if len(row) > 2 else ""
                if not contact_name or contact_name == '-':
                    contact_name = f"联系人{i}"
                
                # 合并所有电话号码（有效手机号 + 更多电话）
                phone_numbers = []
                
                # 添加有效手机号（第9列）
                if len(row) > 9 and row[9] and row[9].strip() != '-':
                    mobile = row[9].strip()
                    if mobile:
                        phone_numbers.append(mobile)
                
                # 添加更多电话（第10列）
                if len(row) > 10 and row[10] and row[10].strip() != '-':
                    more_phones = row[10].strip()
                    if more_phones:
                        # 分割多个电话号码（可能用分号、逗号分隔）
                        for phone_part in more_phones.replace(';', ',').split(','):
                            phone_part = phone_part.strip()
                            if phone_part and phone_part not in phone_numbers:
                                phone_numbers.append(phone_part)
                
                # 合并所有电话号码
                if phone_numbers:
                    phone = ' / '.join(phone_numbers)
                else:
                    phone = f"1380013800{i:02d}"  # 生成假电话号码
                
                # 构建公司数据
                company = {
                    "id": i,
                    "name": row[0].strip() if len(row) > 0 else f"企业{i}",
                    "contact": contact_name,
                    "phone": phone,
                    "address": row[5].strip() if len(row) > 5 else "",
                    "industry": "泳装相关",  # 由于都是泳装搜索结果
                    "scale": row[12].strip() if len(row) > 12 and row[12] != '-' else "未知",
                    "registration": row[4].strip() if len(row) > 4 else "",
                    "capital": row[3].strip() if len(row) > 3 else "",
                    "status": 1,  # 默认未拜访
                    "visitRecord": "",
                    "province": row[6].strip() if len(row) > 6 else "",
                    "city": row[7].strip() if len(row) > 7 else "",
                    "district": row[8].strip() if len(row) > 8 else "",
                    "registrationStatus": row[1].strip() if len(row) > 1 else "",
                    "email": "",  # CSV中没有邮箱字段
                    "website": row[13].strip() if len(row) > 13 and row[13] != '-' else "",
                    "description": row[14].strip() if len(row) > 14 else ""
                }
                
                companies.append(company)
                print(f"处理第 {i} 条: {company['name']}")
    
    except Exception as e:
        print(f"处理CSV文件时出错: {e}")
        return
    
    print(f"总共处理了 {len(companies)} 条企业数据")
    
    # 生成JavaScript代码
    js_code = f"""
        // 从企查查CSV文件生成的真实企业数据 (共{len(companies)}条)
        const companyData = {json.dumps(companies, ensure_ascii=False, indent=8)};
    """
    
    # 保存到文件
    with open('company_data.js', 'w', encoding='utf-8') as f:
        f.write(js_code)
    
    print(f"JSON数据已生成到 company_data.js 文件")
    print(f"数据条数: {len(companies)}")
    
    return companies

if __name__ == "__main__":
    process_csv_to_json()