import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { ref, push, onValue, set, update, remove } from "firebase/database";
// --- ส่วนจัดการไอคอน (SVG ฝังในตัว) ---
const Icon = ({ path, size = 20, className = "" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ display: "inline-block", verticalAlign: "text-bottom" }}
    dangerouslySetInnerHTML={{ __html: path }}
  />
);

const icons = {
  save: '<path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>',
  fileText:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>',
  checkCircle:
    '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
  list: '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  lock: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  shuffle:
    '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  search:
    '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  chevronDown: '<polyline points="6 9 12 15 18 9"/>',
  crown: '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
  calendar:
    '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  bookOpen:
    '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  userPlus:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>',
  trash:
    '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  externalLink:
    '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',
  penTool:
    '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>',
  clipboard:
    '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 12h.01"/><path d="M13 12h5"/><path d="M9 16h.01"/><path d="M13 16h5"/><path d="M9 8h.01"/><path d="M13 8h5"/>',
  link: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  pencil: '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  alertCircle:
    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  barChart:
    '<line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/>',
  user: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
  star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  toy: '<path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z"/><path d="M9 21h6"/>',
  game: '<rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 12h4"/><path d="M8 10v4"/><circle cx="17" cy="12" r="1"/>',
  idea: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
};

// --- ข้อมูลคงที่ (Data) ---
const POSITIONS = [
  "ครูชำนาญการพิเศษ",
  "ครูชำนาญการ",
  "ครู",
  "ครูผู้ช่วย",
  "พนักงานราชการ",
  "ครูอัตราจ้าง",
  "พี่เลี้ยงเด็กพิการ",
];
const AWARDS_LIST = [
  "ชนะเลิศ",
  "รองชนะเลิศอันดับ 1",
  "รองชนะเลิศอันดับ 2",
  "ชมเชย",
  "เข้าร่วม",
];

const TEACHER_NAMES_RAW = [
  "นางวีระดี กองแก้ว",
  "นายสุกกรี วามะ",
  "นางนภาพร คงสอน",
  "นายสาธิต วารีกุล",
  "นางสาวสัณฆ์สินี ทองเจือเพชร",
  "นายเดชา ภุมมาวงศ์",
  "นายพัทพล เพ็ชรสุวรรณ์",
  "นายอนุสารน์ ไกรแก้ว",
  "นางสาวถนอมศรี แซ่ฮั่น",
  "นายจีระพงศ์ เพียรเจริญ",
  "นางนิภาภรณ์ ก้งท้ง",
  "นางไรหนับ หมัดสะอิ",
  "นางสุชาดา ทวีทรัพย์",
  "นางสาวนูรีมัน วุนชูแก้ว",
  "นางสาวศุภวรรณ พุทธสุภะ",
  "นางนารถฤดี อนุจันทร์",
  "ว่าที่ ร.ต.หญิงสิริรัตน์ นกแก้ว",
  "นางจันทนี จิตละเอียด",
  "นายนัธทวัฒน์ มารักษา",
  "นายปรเมศร์ บำรุงหนูไหม",
  "นางสาวดุสิตา สันซัง",
  "นางสาวรัตน์ติกาล ฤทธิ์รักษา",
  "นางสาววรรณภา อุปการัตน์",
  "นางสาวอรจิรา มณีรัตนสุบรรณ",
  "นางสาวอารีย์ ใบดิน",
  "นางธีมาพร ทองเจือเพชร",
  "นางดวงกมล อุบล",
  "นางสาวชัญญานุช สุวรรณนิตย์",
  "นางสาวกมลวรรณ บุญมาก",
  "นางสาวอามีร่าห์ จินเดหวา",
  "นางสาวอรอนงค์ ภูมิพงศ์ไทย",
  "นายอริวัฒน์ สรรเพชร",
  "นางสาววิรัลทิพย์ มุณีรัตน์",
  "นายกิตติพงษ์ บิลหร่อหีม",
  "นางสุกัลญา เซ็นมุลิ",
  "นางสาวเนตรทราย แหละปานแก้ว",
  "นางพิไลวรรณ์ ธรรมเพ็ชร",
  "นางณัฐมน สาระเจริญ",
  "นางจุฑามาส ธีรภาพสถาพร",
  "นางสาวจุไรวรรณ สุวรรณมณี",
  "นางสาวสุมณฑา บิลเดช",
  "นางสาวหนึ่งฤทัย แสงศรี",
  "นางสาววิชุดา จันท์รัตนะ",
  "นางสาวอัมพวัน แก้วเพชร",
  "นางสาวพีรนุช หิรัญวงศ์",
  "ว่าที่ ร.ต.หญิงจินดา ทองวิเชียร",
  "นายนุรดิน ยูโซะ",
  "นางสาวศศิวิมล เจริญวิริยะภาพ",
  "นางสาวพัชรพร หนูอ่อน",
  "นางสุจารี ถาวรจิตต์",
  "นางสาวชุติมา เอกนก",
  "นางสาวอาริญา เกิดชู",
  "นางสาวฟารีนัส สามัญ",
  "ว่าที่ ร.ต.อับดุลรอฟิก ยะสะแต",
  "นายพิศาล เพ็ชรสุวรรณ์",
  "นางสาวกิ่งกาญจน์ ตันติวุฒิ",
  "นางสาวชญาดา โกมาด",
  "นางสาววรางคณางค์ ลานแดง",
  "นายฐปกรณ์ หุลกิจ",
  "นางสาวณัฏฐินี คงทอง",
  "นายรุสมาน ตาเยะ",
  "นางสาววรรณพร เสน่หา",
  "นางภารดี คงสี",
  "นางนริสา เส็นหลีหมีน",
  "นางสาวจุรีรัตน์ นุรักษ์",
  "นางเยาวธิดา รัตญา",
  "นางสาวรูวัยดา หวังยี",
  "นายวิชยา ไชยแก้ว",
  "นางสาวประกายฟ้า ปวีณพงศ์",
  "นางสาวธัญวลัย นวลละออง",
  "นางสาววศินี ทิพย์รองพล",
  "นางสาวสุรัสวดี ศิริพันธ์",
  "นางสาวนุชนารถ หมัดอะดั้ม",
  "นางสาวนริศรา ผิวผ่อง",
  "นางสาวนพัฐธิกา กิตติยศพัฒน์",
  "นายจารึก นุ่นศรี",
  "นางสาวมารียะ สะอะ",
  "นายศุภวุฒิ ทองเจือเพชร",
  "นางสาวสิรตา ทองแกมแก้ว",
  "นางสาววันวิสา สุขสว่างผล",
  "นายรอมือลี สาและ",
  "นางสาวมารีณีย์ ตาเยะ",
  "นางจารุวรรณ จันทชาติ",
  "นางสิริพร หลีสุวรรณ",
  "นางรุสณีย์ ตำหละ",
  "นางสาวสุคนธมาศ รักเสมอ",
  "ว่าที่ ร.ต.หญิง เตชินี หมัดอาดัม",
  "นายพชร อินทะมาตย์",
  "นางสาวอัสมา ปรีพันธ์",
  "นางสาวจิรฐา ขุนฤทธิ์สง",
  "นางอุดารัตน์ หนูเสน",
  "นายวราห์ หมายดี",
  "นางสาวกุลธิดา ชูมณี",
  "นางสาวคัมพิรา ชูประดิษ",
  "นางสาววนิดา ประสมพงค์",
  "นางสาวปภาวรา สรรเสริญ",
  "นางสาวกันย์สินี ชูมี",
  "นางสาวอารยา บิลหรีม",
  "นางสาวนิชการต์ เกื้อสกุล",
  "นางสาวอัยนี ดีแม",
  "นางสาวสุนิษา คลังธาร",
  "นางสาวนิกัษมา หนิเต็ม",
  "นางสาววรัญญา นพภาศรี",
  "นางสาวลดาวัลย์ รัศมี",
  "นางสาวลัลล์ลลิล ศรีนิล",
  "นางสาวลักษิกา วิไลรัตน์",
  "นางสาวศศิวรรณ เพชรรัตน์",
  "นายไสฟูดิน สาและ",
  "นางสาวจิตนา นุ่นศรี",
  "นายทินกร เพ็ชรสุวรรณ์",
  "นายบุญเกื้อ สุขสบาย",
  "นายอาบิต เจ๊ะมิ",
  "นางสาวนิตยา ทองเพชรคง",
  "นางสาววันดี เพชรสุวรรณ",
  "นางสาวพวงทอง มะณีบัว",
  "นางสาวธัญญารัตน์ รัตนบริพันธ์",
  "นางนิดา ณ พัทลุง",
  "นางสุนิสา ยอดแก้ว",
  "นางสาวปิยธิดา เมืองน้อย",
  "นางสาวไมมูน๊ะ หลีสุวรรณ",
  "นางชนิสรา ดำแก้ว",
  "นางสาวพันธ์ทิพย์ สุขเอียด",
  "นางสาวพัชรี ดิสรังโส",
  "นายซอลีฮี มะดาแฮ",
  "นางสาวโสรยา สันเบ็ญหมัด",
  "นางยุพิน อยู่สุข",
  "นางสุดาวดี ขวัญจินดา",
  "นางสาวธนิสร สุวรรณโณ",
  "นางสาวนุชจรี แสงสีดำ",
  "นางสาวชนัญญ์ทิชา มุสิแก้ว",
  "นางสาวจำนงค์ ศิริยอด",
  "นางศิริพร หนูน้อย",
  "นางสาวนัฐการณ์ จันทร์ช่วย",
  "นางสาวกนกวรรณ หนูแก้ว",
  "นางสาวนุสบา ผลาวนิตย์",
  "นางสาวจารุวรรณ จาโร",
  "นางสาวอารตี แก้วนิล",
  "นายจักรินทร์ หัตถประดิษฐ์",
  "นายอนุวัฒน์ ปัตตะเน",
  "นายวงศกร ไชยแก้ว",
  "นางสาววรรณวนัช เอกนก",
  "นางอนันท์ แก้วพึ่งบุญ",
  "นางสาวนภิษา สังข์น้อย",
  "นางสาวจุฑาวรรณ์ รงฤทธิ์",
  "นายอานาส หะมีแย",
  "นางสาวอรวี สันติเพชร",
  "นางกาญจนา หนูคง",
  "นางสาวจันทร์จิรา ชูแว่น",
  "นางสาวนูรี หะมะ",
  "นางสาวชนิสรา พุ่มทอง",
  "นายมุสลิม วุ่นชูแก้ว",
];
const TEACHERS_LIST = TEACHER_NAMES_RAW.map((name) =>
  name.replace(/\s+/g, " ").trim()
).sort();

const CLASSROOMS = [
  "ห้องเรียนเตรียมความพร้อม 1",
  "ห้องเรียนเตรียมความพร้อม 2",
  "ห้องเรียนเตรียมความพร้อม 3",
  "ห้องเรียนเตรียมความพร้อม 4",
  "ห้องเรียนเตรียมความพร้อม 5",
  "ห้องเรียนเตรียมความพร้อม 6",
  "ห้องเรียนเตรียมความพร้อม 7",
  "ห้องเรียนเตรียมความพร้อม 8",
  "ห้องเรียนเตรียมความพร้อม 9",
  "ห้องเรียนเตรียมความพร้อม 10 (หน่วยบริการสทิงพระ)",
  "ห้องเรียนเตรียมความพร้อม 11 (หน่วยบริการสิงหนคร)",
  "ห้องเรียนเตรียมความพร้อม 12 (หน่วยบริการหาดใหญ่)",
  "ห้องเรียนเตรียมความพร้อม 13 (หน่วยบริการเทพา)",
  "ห้องเรียนเตรียมความพร้อม 14 (หน่วยบริการสะบ้าย้อย)",
  "ห้องเรียนเตรียมความพร้อม 15 (หน่วยบริการระโนด)",
  "ห้องเรียนเตรียมความพร้อม 16 (หน่วยบริการเมืองสงขลา)",
  "ห้องเรียนเตรียมความพร้อม 17 (หน่วยบริการคลองหอยโข่ง)",
  "ห้องเรียนเตรียมความพร้อม 18 (หน่วยบริการสะเดา)",
  "ห้องเรียนเตรียมความพร้อม 19 (หน่วยบริการนาหม่อม)",
  "ห้องเรียนเตรียมความพร้อม 20 (หน่วยบริการนาทวี)",
  "ห้องเรียนเตรียมความพร้อม 21 (หน่วยบริการควนเนียง)",
  "ห้องเรียนเตรียมความพร้อม 22 (หน่วยบริการบางกล่ำ)",
  "ห้องเรียนเตรียมความพร้อม 23 (หน่วยบริการรัตภูมิ)",
  "ห้องเรียนเตรียมความพร้อม 24 (หน่วยบริการกระแสสินธุ์)",
  "ห้องเรียนคู่ขนานบุคคลออทิสติก โรงเรียนเทศบาล 2 (บ้านหาดใหญ่)",
  "ห้องเรียนคู่ขนานบุคคลออทิสติก โรงเรียนวัดเจริญภูผา",
  "ห้องเรียนคู่ขนานบุคคลออทิสติก โรงเรียนบ้านทำเนียบ",
  "ห้องเรียนฝึกทักษะพื้นฐานอาชีพ",
  "ห้องเรียนอรรถบำบัด",
  "ห้องเรียนกายภาพบำบัด",
  "ห้องเรียนดนตรี",
  "ห้องเรียนศิลปะ",
  "ห้องเรียนแพทย์แผนไทย",
  "ห้องเรียนศูนย์เทคโนโลยีสารสนเทศเพื่อเด็กป่วยในโรงพยาบาล",
];

const SURVEY_QUESTIONS = [
  {
    category: "ด้านสภาพแวดล้อม (Context)",
    items: [
      "ความเหมาะสมของสถานที่จัดกิจกรรม",
      "ความพร้อมของอุปกรณ์และสิ่งอำนวยความสะดวก",
      "บรรยากาศโดยรวมเอื้อต่อการจัดกิจกรรม",
      "ระยะเวลาในการจัดกิจกรรมมีความเหมาะสม",
    ],
  },
  {
    category: "ด้านปัจจัยนำเข้า (Input)",
    items: [
      "ความชัดเจนของเกณฑ์การประกวด",
      "วิธีดำเนินการเป็นไปตามที่กำหนดไว้ในกิจกรรม",
      "ความพร้อมของระบบการลงทะเบียนและการส่งผลงาน",
      "คุณสมบัติและความเหมาะสมของคณะกรรมการ",
    ],
  },
  {
    category: "ด้านการประเมินกระบวนการ (Process)",
    items: [
      "การประชาสัมพันธ์กิจกรรมมีความทั่วถึง",
      "มีการกำหนดขั้นตอนและชี้แจงการดำเนินกิจกรรมที่ชัดเจน",
      "ระยะเวลาในการนำเสนอผลงานแต่ละชิ้น",
      "การชี้แจงเกณฑ์การให้คะแนนที่ชัดเจน",
    ],
  },
  {
    category: "ด้านการประเมินผลผลิต (Product)",
    items: [
      "ความพึงพอใจต่อผลลัพธ์ของกิจกรรม",
      "การพัฒนาทักษะหรือความรู้ที่ได้รับจากกิจกรรม",
      "ประโยชน์ที่ได้รับจากกิจกรรมนี้",
      "การนำผลงานไปใช้ประโยชน์ในการจัดการเรียนการสอน",
    ],
  },
];

// --- UI Components ---
const SearchableSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <div
        className="w-full border border-amber-200 rounded-md shadow-sm bg-white p-2.5 cursor-pointer flex justify-between items-center hover:border-amber-400 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-800" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <Icon path={icons.chevronDown} className="text-amber-500" />
      </div>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-amber-200 rounded-md shadow-xl max-h-60 overflow-hidden flex flex-col animate-fade-in">
          <div className="p-2 border-b border-gray-100 bg-amber-50 relative">
            <Icon
              path={icons.search}
              size={16}
              className="absolute left-4 top-5 text-gray-400"
            />
            <input
              type="text"
              className="w-full pl-8 pr-2 py-2 border border-amber-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
              placeholder="พิมพ์เพื่อค้นหา..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, idx) => (
                <div
                  key={idx}
                  className="p-2 hover:bg-amber-100 cursor-pointer rounded text-sm text-gray-700"
                  onClick={() => {
                    onChange(option);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                >
                  {option}
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                ไม่พบรายชื่อนี้
              </div>
            )}
          </div>
        </div>
      )}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

const Header = ({ setPage }) => (
  <header className="bg-gradient-to-r from-[#8B0000] via-[#A0522D] to-[#8B4513] text-white shadow-xl border-b-[6px] border-[#FFD700] relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/thai-pattern.png')] pointer-events-none"></div>
    <div className="container mx-auto px-4 py-4 relative z-10">
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 justify-center md:justify-start">
        <div className="bg-white p-1.5 md:p-2 rounded-full shadow-lg border-2 md:border-4 border-[#FFD700] flex-shrink-0">
          <img
            src="https://i.postimg.cc/63FpkbrB/logo-resized.png"
            alt="Logo"
            className="h-16 w-16 md:h-24 md:w-auto object-contain"
          />
        </div>
        <div className="text-center md:text-left flex-1 min-w-0">
          <h1 className="text-lg md:text-3xl font-bold font-serif text-[#FFD700] drop-shadow-md tracking-wide leading-tight break-words">
            ระบบลงทะเบียนกิจกรรมผลิตสื่อการสอน
            <br className="hidden md:block" />
            <span className="text-white inline-block">
              และประกวดสื่อการสอน ปีการศึกษา 2568
            </span>
          </h1>
          <h2 className="text-sm md:text-lg text-[#FFE4B5] font-medium mt-1 font-serif">
            ศูนย์การศึกษาพิเศษ เขตการศึกษา 3 จังหวัดสงขลา
          </h2>
          <div className="flex flex-wrap gap-2 md:gap-4 mt-2 justify-center md:justify-start text-xs md:text-sm font-light text-white">
            <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md border border-[#FFD700]/30 whitespace-nowrap">
              <Icon
                path={icons.calendar}
                size={12}
                className="text-[#FFD700] mr-1"
              />{" "}
              6 มี.ค. 69
            </span>
            <span className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-md border border-[#FFD700]/30 whitespace-nowrap">
              <Icon
                path={icons.crown}
                size={12}
                className="text-[#FFD700] mr-1"
              />{" "}
              ธีมภูมิปัญญาไทย
            </span>
          </div>
        </div>
        <nav className="flex flex-wrap justify-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
          <button
            onClick={() => setPage("home")}
            className="flex-1 md:flex-none px-3 py-2 rounded-full bg-[#FFD700] text-[#8B0000] hover:bg-white hover:text-[#8B0000] font-bold shadow-lg transition flex items-center justify-center gap-1 text-xs md:text-sm border-2 border-[#B8860B] min-w-[100px]"
          >
            <Icon path={icons.save} size={14} /> ลงทะเบียน
          </button>
          <button
            onClick={() => setPage("survey")}
            className="flex-1 md:flex-none px-3 py-2 rounded-full bg-[#fff] text-[#8B0000] hover:bg-[#FFE4B5] font-bold shadow-lg transition flex items-center justify-center gap-1 text-xs md:text-sm border-2 border-[#8B0000] min-w-[100px]"
          >
            <Icon path={icons.star} size={14} /> แบบประเมิน
          </button>
          <button
            onClick={() => setPage("admin")}
            className="flex-1 md:flex-none px-3 py-2 rounded-full bg-black/30 text-[#FFD700] hover:bg-black/50 border border-[#FFD700]/50 transition flex items-center justify-center gap-1 text-xs md:text-sm font-medium min-w-[100px]"
          >
            <Icon path={icons.lock} size={14} /> จนท.
          </button>
        </nav>
      </div>
    </div>
  </header>
);

// --- Pages ---

// 1. Satisfaction Survey (Updated content)
const SatisfactionSurvey = ({ onSubmit }) => {
  const [status, setStatus] = useState([]);
  const [otherStatus, setOtherStatus] = useState("");
  const [position, setPosition] = useState("");
  const [ratings, setRatings] = useState({});
  const [suggestion, setSuggestion] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleStatusChange = (val) =>
    setStatus((prev) =>
      prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val]
    );

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalStatus = status.includes("อื่นๆ")
      ? [...status.filter((s) => s !== "อื่นๆ"), `อื่นๆ (${otherStatus})`]
      : status;
    onSubmit({ status: finalStatus, position, ratings, suggestion });
    setSubmitted(true);
    window.scrollTo(0, 0);
  };

  if (submitted)
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="bg-white p-10 rounded-xl shadow-xl border-t-8 border-[#228B22] text-center max-w-lg w-full animate-fade-in">
          <div className="w-20 h-20 bg-[#F0FFF0] rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon
              path={icons.checkCircle}
              size={40}
              className="text-[#228B22]"
            />
          </div>
          <h2 className="text-2xl font-bold text-[#228B22] font-serif mb-2">
            บันทึกแบบประเมินเรียบร้อยแล้ว
          </h2>
          <p className="text-gray-600">ขอบคุณสำหรับความคิดเห็นของท่าน</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-8 text-[#8B0000] underline text-sm"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#DEB887]">
        <div className="bg-[#8B4513] p-6 text-center text-white border-b-4 border-[#FFD700]">
          <h2 className="text-2xl font-bold font-serif mb-1">
            แบบประเมินความพึงพอใจ
          </h2>
          <p className="text-[#FFE4B5] text-sm">
            โครงการส่งเสริมการผลิตสื่อการเรียนการสอน
            กิจกรรมการผลิตสื่อและประกวดสื่อการเรียนการสอน ปีการศึกษา 2568
          </p>
        </div>
        <form onSubmit={handleSubmit} className="p-8 bg-[#FFFAF0]">
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#8B0000] border-b border-[#DEB887] pb-2 mb-4 font-serif">
              ตอนที่ 1 ข้อมูลสถานภาพทั่วไปของผู้ตอบแบบสอบถาม
            </h3>
            <div className="mb-4 space-y-2">
              <label className="block font-semibold text-[#5D4037]">
                สถานะของท่าน (ตอบได้มากกว่า 1 ข้อ)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                {[
                  "ผู้เข้าประกวดสื่อการสอน",
                  "คณะกรรมการตัดสินการประกวด",
                  "ผู้ผลิตสื่อและจัดทำรายงานสื่อการสอน",
                  "คณะทำงาน",
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      onChange={() => handleStatusChange(item)}
                      className="rounded text-[#8B4513] focus:ring-[#8B4513]"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
                <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                  <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                    <input
                      type="checkbox"
                      onChange={() => handleStatusChange("อื่นๆ")}
                      className="rounded text-[#8B4513] focus:ring-[#8B4513]"
                    />
                    <span className="text-sm">อื่นๆ ระบุ</span>
                  </label>
                  <input
                    type="text"
                    className="border-b border-[#8B4513] bg-transparent outline-none flex-1 text-sm px-1"
                    disabled={!status.includes("อื่นๆ")}
                    onChange={(e) => setOtherStatus(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block font-semibold text-[#5D4037]">
                ตำแหน่งของท่าน
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-4">
                {[
                  "ข้าราชการ",
                  "พนักงานราชการ",
                  "พี่เลี้ยงเด็กพิการ",
                  "ครูอัตราจ้าง",
                ].map((item) => (
                  <label
                    key={item}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="position"
                      value={item}
                      onChange={(e) => setPosition(e.target.value)}
                      className="text-[#8B4513] focus:ring-[#8B4513]"
                    />
                    <span className="text-sm">{item}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#8B0000] border-b border-[#DEB887] pb-2 mb-4 font-serif">
              ตอนที่ 2
              ความพึงพอใจในการจัดโครงการส่งเสริมการผลิตสื่อการเรียนการสอน
              กิจกรรมการประกวดสื่อการเรียนการสอน
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-[#DEB887] text-[#5D4037]">
                    <th className="p-3 text-left">ประเด็นการประเมิน</th>
                    <th className="p-3 text-center">มากที่สุด (5)</th>
                    <th className="p-3 text-center">มาก (4)</th>
                    <th className="p-3 text-center">ปานกลาง (3)</th>
                    <th className="p-3 text-center">น้อย (2)</th>
                    <th className="p-3 text-center">น้อยที่สุด (1)</th>
                  </tr>
                </thead>
                <tbody>
                  {SURVEY_QUESTIONS.map((s, sIdx) => (
                    <React.Fragment key={sIdx}>
                      <tr className="bg-[#FFF8DC]">
                        <td
                          colSpan={6}
                          className="p-2 font-bold text-[#8B4513] border border-[#DEB887]"
                        >
                          {s.category}
                        </td>
                      </tr>
                      {s.items.map((item, iIdx) => (
                        <tr
                          key={iIdx}
                          className="hover:bg-white border-b border-[#EEE8AA]"
                        >
                          <td className="p-3 border-r border-[#DEB887]">
                            {item}
                          </td>
                          {[5, 4, 3, 2, 1].map((sc) => (
                            <td
                              key={sc}
                              className="text-center p-2 border-r border-[#DEB887]"
                            >
                              <input
                                type="radio"
                                name={`r-${sIdx}-${iIdx}`}
                                value={sc}
                                onChange={() =>
                                  setRatings({
                                    ...ratings,
                                    [`${sIdx}-${iIdx}`]: sc,
                                  })
                                }
                                required
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-lg font-bold text-[#8B0000] border-b border-[#DEB887] pb-2 mb-4 font-serif">
              ข้อเสนอแนะเพิ่มเติม
            </h3>
            <textarea
              className="w-full border border-[#DEB887] rounded-lg p-3"
              rows={4}
              onChange={(e) => setSuggestion(e.target.value)}
            ></textarea>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-[#8B0000] text-[#FFD700] px-8 py-3 rounded-full font-bold shadow-lg hover:bg-[#A52A2A] border-2 border-[#FFD700]"
            >
              ส่งแบบประเมิน
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- New Component: Ideas Section ---
const MediaIdeas = () => {
  const [activeTab, setActiveTab] = useState(0);
  const ideas = [
    {
      title: "ของเล่นพื้นบ้าน (Toy-based Learning)",
      icon: icons.toy,
      items: [
        {
          name: "เดินกะลา",
          desc: "สอนเรื่องสมดุลและการนำเศษวัสดุ (กะลามะพร้าว) มาใช้ประโยชน์",
        },
        {
          name: "พับใบตอง/สานปลาตะเพียน",
          desc: "ฝึกสมาธิ กล้ามเนื้อมัดเล็ก และการเรียนรู้เรื่องพืชพรรณท้องถิ่น",
        },
        {
          name: "กังหันไม้ไผ่ หรือ ปืนก้านกล้วย",
          desc: "เรียนรู้เรื่องแรงลมและคุณสมบัติของต้นกล้วย",
        },
      ],
    },
    {
      title: "เล่าเรื่องและภาพจำ (Visual & Storytelling)",
      icon: icons.bookOpen,
      items: [
        {
          name: "สมุดเล่มเล็ก (Pop-up Book)",
          desc: "ทำมือขึ้นมาเองโดยเล่าเรื่อง ประเพณีในท้องถิ่น เช่น ประเพณีลอยกระทง หรือวันสงกรานต์ โดยให้เด็กๆ ช่วยกันระบายสีและติดกาว",
        },
        {
          name: "หุ่นนิ้วมือ/หุ่นเชิดจากเศษผ้า",
          desc: "ใช้เล่าประกอบนิทานพื้นบ้านหรือวรรณคดีไทย ทำให้เรื่องเล่ามีชีวิตชีวาขึ้น",
        },
        {
          name: "บัตรคำทำมือ (Flashcards)",
          desc: "ใช้ภาพวาดฝีมือเด็กๆ คู่กับคำศัพท์เกี่ยวกับชื่อสมุนไพร เครื่องครัวไทย (เช่น สาก ครก กระทะ) หรือชื่อขนมไทย",
        },
      ],
    },
    {
      title: "เกมและการทดลอง (Game-based Learning)",
      icon: icons.game,
      items: [
        {
          name: "ตารางหมากรุกหรือหมากเก็บ",
          desc: "ใช้ก้อนหินหรือเมล็ดผลไม้มาเป็นอุปกรณ์ สอนเรื่องการวางแผนและกติกาทางสังคม",
        },
        {
          name: 'แผงสาธิตสมุนไพร "ดม-ดู-ดึง"',
          desc: "ทำบอร์ดที่มีซองใส่สมุนไพรแห้ง (ขิง ข่า ตะไคร้ ใบมะกรูด) ให้เด็กๆ ได้ดมกลิ่นและสัมผัสพื้นผิวจริง",
        },
        {
          name: "โมเดลจำลองบ้านไทย",
          desc: "ใช้ไม้ไอศกรีมหรือกระดาษลังมาต่อเป็นบ้านทรงไทย เพื่อให้เห็นภูมิปัญญาเรื่องการยกใต้ถุนสูงป้องกันน้ำท่วม",
        },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-[#DEB887] shadow-md">
      <h3 className="text-[#8B4513] font-bold text-lg mb-4 flex items-center gap-2 font-serif">
        <Icon path={icons.idea} className="text-yellow-500" size={24} />{" "}
        ไอเดียสื่อการสอนภูมิปัญญาไทย
      </h3>
      <div className="space-y-3">
        {ideas.map((idea, idx) => (
          <div
            key={idx}
            className="border border-amber-200 rounded-lg overflow-hidden"
          >
            <button
              onClick={() => setActiveTab(activeTab === idx ? -1 : idx)}
              className={`w-full text-left p-3 font-bold flex justify-between items-center transition-colors ${
                activeTab === idx
                  ? "bg-[#8B4513] text-white"
                  : "bg-amber-50 text-[#8B4513] hover:bg-amber-100"
              }`}
            >
              <span className="flex items-center gap-2">
                <Icon path={idea.icon} size={18} /> {idea.title}
              </span>
              <Icon
                path={icons.chevronDown}
                className={`transform transition-transform ${
                  activeTab === idx ? "rotate-180" : ""
                }`}
              />
            </button>
            {activeTab === idx && (
              <div className="p-4 bg-white animate-fade-in">
                <ul className="space-y-3">
                  {idea.items.map((item, i) => (
                    <li
                      key={i}
                      className="text-sm text-gray-700 pb-2 border-b border-gray-100 last:border-0 last:pb-0"
                    >
                      <strong className="text-[#8B0000] block mb-1">
                        {item.name}
                      </strong>
                      {item.desc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const EditRequestModal = ({ submission, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ ...submission });
  const [teacherName, setTeacherName] = useState("");
  const [teacherPos, setTeacherPos] = useState(POSITIONS[2]);

  const addTeacher = () => {
    if (!teacherName) return;
    setFormData({
      ...formData,
      teachers: [
        ...formData.teachers,
        { name: teacherName, position: teacherPos },
      ],
    });
    setTeacherName("");
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#FFFAF0] rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border-2 border-[#FFD700] max-h-[90vh] flex flex-col">
        <div className="bg-[#8B0000] p-4 text-white flex justify-between items-center">
          <h3 className="font-bold font-serif flex items-center gap-2">
            <Icon path={icons.pencil} /> ขอแก้ไขข้อมูล (ลำดับที่{" "}
            {submission.sequenceNumber})
          </h3>
          <button onClick={onClose}>
            <Icon path={icons.x} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div>
            <label className="block font-bold text-[#8B4513]">ห้องเรียน</label>
            <select
              className="w-full border p-2 rounded"
              value={formData.classroom}
              onChange={(e) =>
                setFormData({ ...formData, classroom: e.target.value })
              }
            >
              {CLASSROOMS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div className="border p-3 rounded bg-white">
            <label className="block font-bold text-[#8B4513] mb-2">
              รายชื่อครู
            </label>
            <div className="flex gap-2 mb-2">
              <div className="flex-1">
                <SearchableSelect
                  options={TEACHERS_LIST}
                  value={teacherName}
                  onChange={setTeacherName}
                  placeholder="เลือกครู..."
                />
              </div>
              <select
                className="border rounded p-1 w-32"
                value={teacherPos}
                onChange={(e) => setTeacherPos(e.target.value)}
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <button onClick={addTeacher} className="bg-[#DEB887] p-2 rounded">
                <Icon path={icons.userPlus} />
              </button>
            </div>
            <ul className="space-y-1">
              {formData.teachers.map((t, idx) => (
                <li
                  key={idx}
                  className="flex justify-between bg-gray-50 p-1 rounded text-sm"
                >
                  <span>
                    {t.name} ({t.position})
                  </span>
                  <button
                    onClick={() =>
                      setFormData({
                        ...formData,
                        teachers: formData.teachers.filter((_, i) => i !== idx),
                      })
                    }
                    className="text-red-500"
                  >
                    <Icon path={icons.trash} size={14} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <label className="block font-bold text-[#8B4513]">ชื่อผลงาน</label>
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={formData.projectTitle}
              onChange={(e) =>
                setFormData({ ...formData, projectTitle: e.target.value })
              }
            />
          </div>
        </div>
        <div className="p-4 border-t bg-gray-50 text-right space-x-2">
          <button onClick={onClose} className="px-4 py-2 text-gray-600">
            ยกเลิก
          </button>
          <button
            onClick={() => onSubmit(formData)}
            className="px-4 py-2 bg-[#8B0000] text-white rounded"
          >
            ส่งคำขอ
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({
  submissions,
  onRegister,
  availableClassrooms,
  onRequestEdit,
  nums,
}) => {
  const [formData, setFormData] = useState({
    classroom: "",
    teachers: [],
    projectTitle: "",
  });
  const [tName, setTName] = useState("");
  const [tPos, setTPos] = useState(POSITIONS[2]);
  const [showModal, setShowModal] = useState(false);
  const [lastSub, setLastSub] = useState(null);
  const [editSub, setEditSub] = useState(null);
  const nextNumber = nums && nums.length > 0 ? nums[nums.length - 1] : "เต็ม";
  const pending = CLASSROOMS.filter(
    (c) => !submissions.map((s) => s.classroom).includes(c)
  );

  const addT = () => {
    if (!tName) return alert("เลือกชื่อครู");
    if (formData.teachers.some((t) => t.name === tName)) return alert("ซ้ำ");
    setFormData({
      ...formData,
      teachers: [...formData.teachers, { name: tName, position: tPos }],
    });
    setTName("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (
      !formData.classroom ||
      formData.teachers.length === 0 ||
      !formData.projectTitle
    )
      return alert("กรอกข้อมูลให้ครบ");
    const res = await onRegister(formData);
    if (res) {
      setLastSub(res);
      setShowModal(true);
      setFormData({ classroom: "", teachers: [], projectTitle: "" });
    }
  };

  const handleEditSubmit = (newData) => {
    onRequestEdit(editSub.id, newData);
    setEditSub(null);
    alert("ส่งคำขอแก้ไขเรียบร้อยแล้ว กรุณารอเจ้าหน้าที่อนุมัติ");
  };

  return (
    <div className="container mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-[#FFF8E7] rounded-xl p-5 border-l-4 border-[#8B4513] shadow-md">
          <h3 className="text-[#8B4513] font-bold text-lg mb-4 flex items-center gap-2">
            <Icon path={icons.bookOpen} /> เอกสารและข้อกำหนด
          </h3>
          <ul className="text-sm text-[#5D4037] space-y-4">
            <li className="flex items-start gap-2">
              <Icon
                path={icons.calendar}
                size={18}
                className="text-[#8B0000] mt-0.5 flex-shrink-0"
              />
              <span>
                นำเสนอ:{" "}
                <strong className="text-[#8B0000] text-lg">6 มี.ค. 69</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon
                path={icons.checkCircle}
                size={18}
                className="text-green-600 mt-0.5 flex-shrink-0"
              />
              <span>ส่งตัวแทนนำเสนอผลงานบนเวที</span>
            </li>
            <li className="pt-2 border-t border-[#DEB887]/50">
              <div className="font-bold mb-1 flex items-center gap-2">
                1. เล่มรายงาน{" "}
                <span className="bg-[#8B0000] text-white px-2 py-0.5 rounded-full text-xs">
                  1 เล่ม
                </span>
              </div>
              <div className="text-xs text-gray-700 mb-1 ml-6 bg-white/50 p-1 rounded">
                *(ไม่ต้องแนบไฟล์ในระบบ ให้พิมพ์และนำมาส่งกรรมการ)*
              </div>
              <a
                href="https://docs.google.com/document/d/1Bu-UqSCZX_dfN80bYvvNp82OUd2CebgN/edit?usp=sharing"
                target="_blank"
                className="flex items-center gap-2 text-green-700 font-semibold hover:underline bg-green-50 p-2 rounded border border-green-200 ml-6"
              >
                <Icon path={icons.download} size={16} /> โหลดแบบฟอร์มฯ
              </a>
            </li>
            <li>
              <div className="font-bold mb-1 flex items-center gap-2">
                2. แผ่นพับ{" "}
                <span className="bg-[#8B0000] text-white px-2 py-0.5 rounded-full text-xs">
                  1 ฉบับ
                </span>
              </div>
              <div className="text-xs text-gray-700 mb-1 ml-6 bg-white/50 p-1 rounded">
                *(ไม่ต้องแนบไฟล์ในระบบ ให้พิมพ์และนำมาส่งกรรมการ)*
              </div>
              <div className="bg-amber-100 p-2 rounded border border-amber-200 ml-6 text-xs text-gray-600 mb-2">
                <span className="flex items-center gap-1">
                  <Icon path={icons.idea} size={12} /> สามารถออกแบบเองได้
                </span>
              </div>
              <a
                href="https://www.canva.com/design/DAFb3SwnuzA/0XOnp35Ot3mU0cEwGNC34A/view?utm_content=DAFb3SwnuzA&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink&mode=preview"
                target="_blank"
                className="flex items-center gap-1 text-purple-700 text-xs font-bold hover:underline ml-6"
              >
                <Icon path={icons.externalLink} size={12} /> ตัวอย่างเทมเพลต
                Canva
              </a>
            </li>
            <li className="pt-2 border-t border-[#DEB887]/50">
              <a
                href="https://drive.google.com/file/d/16sHs6uAtU7m-L5CIUjiXXMm6_v-ntkva/view?usp=sharing"
                target="_blank"
                className="flex items-center gap-2 text-blue-700 font-semibold hover:underline"
              >
                <Icon path={icons.link} size={16} /> ดูเกณฑ์การให้คะแนน
              </a>
            </li>
          </ul>
        </div>

        {/* ส่วนไอเดียสื่อการสอน */}
        <MediaIdeas />

        <div className="bg-white rounded-t-xl shadow-lg border border-[#DEB887] overflow-hidden">
          <div className="bg-gradient-to-r from-[#CD853F] to-[#8B4513] p-4 text-white font-bold text-xl flex items-center gap-2 border-b-4 border-[#FFD700]">
            <Icon path={icons.fileText} /> ลงทะเบียน
          </div>
          <div className="p-6 bg-[#FFFAF0]">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="font-bold text-[#8B4513]">1. ห้องเรียน</label>
                <select
                  className="w-full border p-2 rounded"
                  value={formData.classroom}
                  onChange={(e) =>
                    setFormData({ ...formData, classroom: e.target.value })
                  }
                >
                  <option value="">-- เลือก --</option>
                  {availableClassrooms.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-white p-3 rounded border shadow-inner">
                <label className="font-bold text-[#8B4513]">
                  2. ครูผู้จัดทำ
                </label>
                <div className="text-xs text-red-500 mb-2">
                  * สังกัด 2 ห้อง เลือกห้องใดห้องหนึ่ง
                </div>
                <div className="space-y-2">
                  <SearchableSelect
                    options={TEACHERS_LIST}
                    value={tName}
                    onChange={setTName}
                    placeholder="ค้นหาชื่อ..."
                  />
                  <div className="flex gap-2">
                    <select
                      className="border p-2 rounded flex-1 text-sm"
                      value={tPos}
                      onChange={(e) => setTPos(e.target.value)}
                    >
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={addT}
                      className="bg-[#DEB887] p-2 rounded"
                    >
                      <Icon path={icons.userPlus} />
                    </button>
                  </div>
                </div>
                <ul className="mt-3 space-y-1">
                  {formData.teachers.map((t, idx) => (
                    <li
                      key={idx}
                      className="flex justify-between bg-FFF8DC p-2 rounded border border-[#F0E68C] text-sm"
                    >
                      <span>
                        {t.name}
                        <br />
                        <span className="text-xs text-gray-500">
                          {t.position}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            teachers: formData.teachers.filter(
                              (_, i) => i !== idx
                            ),
                          })
                        }
                        className="text-red-500"
                      >
                        <Icon path={icons.trash} size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <label className="font-bold text-[#8B4513]">3. ชื่อผลงาน</label>
                <input
                  type="text"
                  className="w-full border p-2 rounded"
                  placeholder="พิมพ์ชื่อผลงาน..."
                  value={formData.projectTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, projectTitle: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#8B0000] text-[#FFD700] font-bold py-3 rounded shadow-lg hover:bg-[#A52A2A]"
              >
                ยืนยันการลงทะเบียน
              </button>
            </form>
          </div>
        </div>
      </div>
      <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-[750px] border border-[#DEB887] overflow-hidden">
          <div className="bg-[#8B4513] text-white p-4 font-bold flex justify-between border-b-4 border-[#FFD700]">
            <span>
              <Icon path={icons.checkCircle} className="mr-2" /> ลงทะเบียนแล้ว
            </span>
            <span className="text-xs bg-white/20 px-2 py-1 rounded">
              เรียงตามการสมัคร
            </span>
          </div>
          <div className="overflow-y-auto flex-1 p-0 bg-[#FFFAF0] divide-y divide-[#DEB887]/30">
            {submissions.length === 0 ? (
              <div className="p-8 text-center text-[#D2B48C]">
                ยังไม่มีข้อมูล
              </div>
            ) : (
              submissions
                .sort((a, b) => a.id - b.id)
                .map((sub, idx) => (
                  <div
                    key={sub.id}
                    className={`p-4 flex gap-3 relative ${
                      sub.hasEditRequest
                        ? "bg-amber-50"
                        : "bg-white hover:bg-[#FFF8DC]"
                    }`}
                  >
                    <div className="w-14 h-14 bg-[#8B0000] rounded flex flex-col items-center justify-center text-white border-2 border-[#FFD700] shadow flex-shrink-0">
                      <span className="text-[9px] text-[#FFD700]">ลำดับ</span>
                      <span className="text-2xl font-bold leading-none">
                        {sub.sequenceNumber}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>สมัครที่ {idx + 1}</span>
                        {sub.hasEditRequest ? (
                          <span className="text-amber-600 flex items-center bg-amber-100 px-2 rounded">
                            <Icon
                              path={icons.alertCircle}
                              size={10}
                              className="mr-1"
                            />{" "}
                            รออนุมัติแก้ไข
                          </span>
                        ) : (
                          <button
                            onClick={() => setEditSub(sub)}
                            className="hover:text-[#8B0000]"
                          >
                            <Icon path={icons.pencil} size={14} />
                          </button>
                        )}
                      </div>
                      <div className="font-bold text-[#8B4513] text-sm leading-tight">
                        {sub.classroom}
                      </div>
                      <div className="text-gray-900 font-medium">
                        "{sub.projectTitle}"
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg flex flex-col h-[750px] border border-[#DEB887] overflow-hidden">
          <div className="bg-[#5D4037] text-white p-4 font-bold border-b-4 border-[#A0522D] flex items-center gap-2">
            <Icon path={icons.list} /> ยังไม่ส่ง
          </div>
          <div className="overflow-y-auto flex-1 p-4 bg-white">
            {pending.length === 0 ? (
              <div className="text-center text-green-600 font-bold mt-10 border-2 border-green-200 p-4 rounded bg-green-50">
                <Icon
                  path={icons.crown}
                  size={30}
                  className="mx-auto mb-2 text-yellow-500"
                />{" "}
                ครบทุกห้องแล้ว!
              </div>
            ) : (
              <ul className="space-y-2">
                {pending.map((r, i) => (
                  <li
                    key={i}
                    className="bg-[#FFFAF0] p-2 rounded border-l-4 border-[#CD853F] text-sm text-[#5D4037] shadow-sm"
                  >
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {showModal && lastSub && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-[#FFFAF0] rounded-xl shadow-2xl max-w-md w-full text-center overflow-hidden border-4 border-[#FFD700]">
            <div className="bg-gradient-to-r from-[#8B0000] to-[#A52A2A] h-28 flex items-center justify-center relative">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center relative z-10 border-4 border-[#FFD700] shadow mt-10">
                <Icon
                  path={icons.shuffle}
                  size={40}
                  className="text-[#8B0000]"
                />
              </div>
            </div>
            <div className="pt-14 pb-8 px-8">
              <h3 className="text-2xl font-bold text-[#8B0000] mb-2">
                ลงทะเบียนสำเร็จ
              </h3>
              <div className="bg-white p-6 rounded-xl border-2 border-[#DEB887] shadow-inner mb-6">
                <div className="text-sm text-[#8B4513] font-bold">
                  ลำดับการนำเสนอ
                </div>
                <div className="text-8xl font-black text-[#8B0000] drop-shadow-md my-2">
                  {lastSub.sequenceNumber}
                </div>
                <div className="border-t pt-2 text-sm text-gray-600">
                  {lastSub.classroom}
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-full bg-[#8B0000] text-[#FFD700] font-bold py-3 rounded hover:bg-[#A52A2A]"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
      {editSub && (
        <EditRequestModal
          submission={editSub}
          onClose={() => setEditSub(null)}
          onSubmit={handleEditSubmit}
        />
      )}
    </div>
  );
};

const AdminPanel = ({
  submissions,
  surveys,
  onUpdateAward,
  onApproveEdit,
  onRejectEdit,
  onDeleteSubmission,
  password,
  setPassword,
  isLoggedIn,
  setIsLoggedIn,
}) => {
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "0147") setIsLoggedIn(true);
    else alert("ผิด");
  };

  const downloadSurveyCSV = () => {
    const headers = [
      "ID",
      "สถานะ",
      "ตำแหน่ง",
      "ข้อเสนอแนะ",
      ...SURVEY_QUESTIONS.flatMap((s, i) =>
        s.items.map((_, j) => `"${s.category} ข้อ ${j + 1}"`)
      ),
    ];
    const rows = surveys.map((s) => {
      const ratingValues = SURVEY_QUESTIONS.flatMap((section, sIdx) =>
        section.items.map((_, iIdx) => {
          const key = `${sIdx}-${iIdx}`;
          return s.ratings && s.ratings[key] ? s.ratings[key] : "-";
        })
      );
      return [
        s.id,
        `"${(s.status || []).join(",")}"`,
        s.position || "-",
        `"${(s.suggestion || "").replace(/"/g, '""')}"`,
        ...ratingValues,
      ];
    });
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "Satisfaction_Survey_Data.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadCSV = () => {
    const rows = [...submissions]
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
      .map((s) => [
        s.sequenceNumber,
        `"${s.classroom}"`,
        `"${s.teachers.map((t) => `${t.name} (${t.position})`).join(", ")}"`,
        `"${s.projectTitle}"`,
        s.award || "-",
      ]);
    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      ["ลำดับนำเสนอ", "ห้องเรียน", "รายชื่อครู", "ชื่อผลงาน", "รางวัล"].join(
        ","
      ) +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "Result_SK_Special_Ed_2569.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isLoggedIn)
    return (
      <div className="container mx-auto px-4 py-20 flex justify-center">
        <div className="bg-[#FFFAF0] p-10 rounded-xl shadow-xl w-full max-w-md border-t-4 border-[#8B0000] text-center">
          <h2 className="text-2xl font-bold text-[#8B0000] mb-6">
            เจ้าหน้าที่
          </h2>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              className="w-full p-3 border rounded mb-4 text-center"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button className="w-full bg-[#8B0000] text-white py-3 rounded font-bold">
              เข้าสู่ระบบ
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-[#8B0000] flex items-center gap-2">
          <Icon path={icons.crown} size={24} /> จัดการข้อมูล
        </h2>
        <div className="flex gap-2">
          <button
            onClick={downloadSurveyCSV}
            className="bg-[#A0522D] text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Icon path={icons.barChart} /> ประเมิน ({surveys.length})
          </button>
          <button
            onClick={downloadCSV}
            className="bg-[#228B22] text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <Icon path={icons.download} /> รายชื่อ
          </button>
          <button
            onClick={() => setIsLoggedIn(false)}
            className="bg-gray-300 px-4 py-2 rounded"
          >
            ออก
          </button>
        </div>
      </div>
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-[#F0E68C] text-[#8B4513]">
            <tr>
              <th className="p-3 text-center">ลำดับ</th>
              <th className="p-3">ข้อมูล</th>
              <th className="p-3">สถานะ</th>
              <th className="p-3 text-center">รางวัล</th>
              <th className="p-3 text-center">ลบ</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {submissions
              .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
              .map((sub) => (
                <tr
                  key={sub.id}
                  className={sub.hasEditRequest ? "bg-amber-50" : ""}
                >
                  <td className="p-3 text-center font-bold text-xl text-[#8B0000] align-top">
                    {sub.sequenceNumber}
                  </td>
                  <td className="p-3 align-top">
                    <div className="font-bold text-[#8B4513]">
                      {sub.classroom}
                    </div>
                    <div>"{sub.projectTitle}"</div>
                    <div className="text-xs text-gray-500">
                      {(sub.teachers || []).map((t) => t.name).join(", ")}{" "}
                    </div>

                    {/* --- ส่วนแสดงผลการขอแก้ไข --- */}
                    {sub.hasEditRequest && (
                      <div className="mt-2 bg-white border-2 border-amber-300 p-3 rounded-lg text-xs shadow-sm">
                        <div className="font-bold text-amber-700 mb-2 flex items-center gap-1">
                          <Icon path={icons.pencil} size={12} />{" "}
                          มีคำขอแก้ไขข้อมูล:
                        </div>
                        <div className="grid grid-cols-2 gap-4 divide-x divide-gray-200">
                          <div className="pr-2">
                            <div className="font-bold text-gray-500 mb-1 border-b pb-1">
                              ข้อมูลเดิม
                            </div>
                            <div className="mb-1">
                              <span className="font-semibold">ห้อง:</span>{" "}
                              {sub.classroom}
                            </div>
                            <div className="mb-1">
                              <span className="font-semibold">ชื่อสื่อ:</span>{" "}
                              {sub.projectTitle}
                            </div>
                            <div>
                              <span className="font-semibold">ผู้จัดทำ:</span>
                              <ul className="list-disc list-inside pl-1 text-gray-500">
                                {sub.teachers.map((t, i) => (
                                  <li key={i}>{t.name}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="pl-2">
                            <div className="font-bold text-green-600 mb-1 border-b pb-1">
                              ข้อมูลใหม่
                            </div>
                            <div
                              className={`mb-1 ${
                                sub.classroom !== sub.editData.classroom
                                  ? "text-green-700 font-bold bg-green-50"
                                  : ""
                              }`}
                            >
                              <span className="font-semibold">ห้อง:</span>{" "}
                              {sub.editData.classroom}
                            </div>
                            <div
                              className={`mb-1 ${
                                sub.projectTitle !== sub.editData.projectTitle
                                  ? "text-green-700 font-bold bg-green-50"
                                  : ""
                              }`}
                            >
                              <span className="font-semibold">ชื่อสื่อ:</span>{" "}
                              {sub.editData.projectTitle}
                            </div>
                            <div>
                              <span className="font-semibold">ผู้จัดทำ:</span>
                              <ul className="list-disc list-inside pl-1 text-green-700">
                                {(sub.editData?.teachers || []).map((t, i) => (
                                  <li key={i} className="font-bold">
                                    {t.name} ({t.position})
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3 justify-end border-t pt-2">
                          <button
                            onClick={() => onApproveEdit(sub.id)}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded flex items-center gap-1"
                          >
                            <Icon path={icons.check} size={12} /> อนุมัติ
                          </button>
                          <button
                            onClick={() => onRejectEdit(sub.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded flex items-center gap-1"
                          >
                            <Icon path={icons.x} size={12} /> ปฏิเสธ
                          </button>
                        </div>
                      </div>
                    )}
                    {/* --- จบส่วนแสดงผลการขอแก้ไข --- */}
                  </td>
                  <td className="p-3 align-top">
                    {sub.hasEditRequest ? (
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
                        รอแก้ไข
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        ปกติ
                      </span>
                    )}
                  </td>
                  <td className="p-3 align-top">
                    <select
                      className={`border rounded p-1 w-full ${
                        sub.award === "ชนะเลิศ"
                          ? "bg-yellow-100 border-yellow-400"
                          : ""
                      }`}
                      value={sub.award}
                      onChange={(e) => onUpdateAward(sub.id, e.target.value)}
                    >
                      <option value="">-</option>
                      {AWARDS_LIST.map((a) => (
                        <option key={a} value={a}>
                          {a}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-3 text-center align-top">
                    <button
                      onClick={() => onDeleteSubmission(sub.id)}
                      className="text-red-500 hover:bg-red-50 p-2 rounded-full"
                    >
                      <Icon path={icons.trash} />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const App = () => {
  const [page, setPage] = useState("home");
  const [subs, setSubs] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [nums, setNums] = useState([]);
  const [pwd, setPwd] = useState("");
  const [isAuth, setIsAuth] = useState(false);

  // Auto-inject Tailwind & Fonts
  useEffect(() => {
    if (!document.querySelector('script[src="https://cdn.tailwindcss.com"]')) {
      const script = document.createElement("script");
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
    const fontLink = document.createElement("link");
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;700&display=swap";
    fontLink.rel = "stylesheet";
    document.head.appendChild(fontLink);
    document.body.style.fontFamily = "'Sarabun', sans-serif";
  }, []);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("page");
    if (p === "survey") setPage("survey");
    const n = Array.from({ length: CLASSROOMS.length }, (_, i) => i + 1);
    for (let i = n.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [n[i], n[j]] = [n[j], n[i]];
    }
    setNums(n);
  }, []);

  const reg = (d) => {
    if (subs.find((s) => s.classroom === d.classroom)) {
      alert("ห้องนี้ลงทะเบียนไปแล้วครับ");
      return null;
    }
    if (nums.length === 0) {
      alert("ลำดับเต็มแล้วครับ");
      return null;
    }

    // ดึงเลขลำดับ
    const seq = nums.pop();
    setNums([...nums]); // อัปเดต array เลขลำดับที่เหลือ

    const newS = {
      ...d,
      sequenceNumber: seq,
      award: "",
      hasEditRequest: false,
      editData: null,
      timestamp: Date.now(), // ควรเก็บเวลาที่สมัครด้วย
    };

    // --- เพิ่มส่วนนี้: บันทึกลง Firebase ---
    const subRef = ref(db, "submissions");
    const newSubRef = push(subRef); // สร้าง key ใหม่
    set(newSubRef, newS)
      .then(() => console.log("Registered successfully"))
      .catch((err) => alert("Error: " + err.message));
    // ------------------------------------

    // ไม่ต้อง setSubs([...subs, newS]) ตรงนี้ เพราะ useEffect จะดึงข้อมูลล่าสุดมาให้เอง
    return newS;
  };

  // อัปเดตรางวัล
  const updateAward = (id, v) => {
    update(ref(db, `submissions/${id}`), { award: v });
  };

  // ขอแก้ไขข้อมูล (User)
  const reqEdit = (id, d) => {
    update(ref(db, `submissions/${id}`), {
      hasEditRequest: true,
      editData: d,
    });
  };

  // อนุมัติการแก้ไข (Admin)
  const appEdit = (id) => {
    const target = subs.find((s) => s.id === id);
    if (target && target.editData) {
      update(ref(db, `submissions/${id}`), {
        ...target.editData,
        hasEditRequest: false,
        editData: null,
      });
    }
  };

  // ปฏิเสธการแก้ไข (Admin)
  const rejEdit = (id) => {
    update(ref(db, `submissions/${id}`), {
      hasEditRequest: false,
      editData: null,
    });
  };

  // ลบข้อมูล (Admin)
  const handleDeleteSubmission = (id) => {
    if (window.confirm("คุณต้องการลบรายการนี้ใช่หรือไม่?")) {
      remove(ref(db, `submissions/${id}`));
    }
  };
  // --- แก้ไขฟังก์ชันบันทึกแบบประเมิน ให้ส่งไป Firebase ---
  // --- 1. useEffect สำหรับดึงข้อมูลจาก Firebase มาแสดงผล (ใส่ไว้ตรงนี้) ---
  useEffect(() => {
    // ดึงข้อมูลการลงทะเบียน (submissions)
    const subsRef = ref(db, "submissions");
    onValue(subsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setSubs(list); // สมมติว่า state ชื่อ subs ตามโค้ดที่คุณใช้
      }
    });

    // ดึงข้อมูลแบบประเมิน (surveys)
    const surveyRef = ref(db, "surveys");
    onValue(surveyRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setSurveys(list);
      }
    });
  }, []); // [] หมายถึงทำแค่รอบเดียวตอนเปิดหน้าเว็บครั้งแรก

  // --- 2. ฟังก์ชันสำหรับบันทึกแบบประเมินลง Firebase ---
  const handleSurveySubmit = (data) => {
    const surveyRef = ref(db, "surveys");
    const newSurveyRef = push(surveyRef);

    set(newSurveyRef, {
      ...data,
      timestamp: Date.now(),
    })
      .then(() => {
        console.log("บันทึกแบบประเมินสำเร็จ!");
        // อัปเดต state เพื่อให้หน้าจอแสดงผลทันทีโดยไม่ต้องรอดึงใหม่
        setSurveys([...surveys, { id: newSurveyRef.key, ...data }]);
      })
      .catch((error) => {
        alert("เกิดข้อผิดพลาดในการบันทึก: " + error.message);
      });
  };

  // คำนวณห้องที่ยังว่าง
  const availRooms = CLASSROOMS.filter(
    (c) => !subs.map((s) => s.classroom).includes(c)
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Header setPage={setPage} />
      <main className="flex-1">
        {page === "home" && (
          <Dashboard
            submissions={subs}
            onRegister={reg}
            availableClassrooms={availRooms}
            onRequestEdit={reqEdit}
          />
        )}
        {page === "admin" && (
          <AdminPanel
            submissions={subs}
            surveys={surveys}
            onUpdateAward={updateAward}
            onApproveEdit={appEdit}
            onRejectEdit={rejEdit}
            onDeleteSubmission={handleDeleteSubmission}
            password={pwd}
            setPassword={setPwd}
            isLoggedIn={isAuth}
            setIsLoggedIn={setIsAuth}
          />
        )}
        {page === "survey" && (
          <SatisfactionSurvey onSubmit={handleSurveySubmit} />
        )}
      </main>
      <footer className="bg-[#5D4037] text-[#DEB887] py-6 text-center text-sm border-t-4 border-[#8B0000]">
        <p className="font-bold text-[#FFD700]">
          © 2569 ระบบลงทะเบียนโครงการผลิตสื่อการสอน | พัฒนาโดย นางสาวรูวัยดา
          หวังยี
        </p>
        <p className="text-xs text-[#DEB887]/70 mt-1">
          ศูนย์การศึกษาพิเศษ เขตการศึกษา 3 จังหวัดสงขลา
        </p>
      </footer>
    </div>
  );
};

export default App;
