import { NextResponse } from 'next/server';
import sampleData from '../../../../data/out.json'; 

// @ts-expect-error - Bỏ qua cảnh báo thiếu file types của node-nlp
import { NlpManager } from 'node-nlp';

// Khởi tạo AI cục bộ (hỗ trợ tiếng Việt) ở ngoài hàm POST để tránh phải train lại mỗi lần chat
const manager = new NlpManager({ languages: ['vi'], forceNER: true });

// 1. Dạy AI học các câu mẫu (Training data)
// -- Ý định: Nghỉ phép năm
manager.addDocument('vi', 'cho tôi xem ngày phép', 'MY_ANNUALLEAVE');
manager.addDocument('vi', 'tôi còn bao nhiêu phép năm', 'MY_ANNUALLEAVE');
manager.addDocument('vi', 'xem phép năm', 'MY_ANNUALLEAVE');
manager.addDocument('vi', 'nghỉ phép năm', 'MY_ANNUALLEAVE');

// -- Ý định: Lịch sử vắng mặt, ngày nghỉ
manager.addDocument('vi', 'tôi đã nghỉ những ngày nào', 'MY_ABSENCE');
manager.addDocument('vi', 'xem lịch sử vắng mặt', 'MY_ABSENCE');
manager.addDocument('vi', 'tuần trước nghỉ mấy ngày', 'MY_ABSENCE');
manager.addDocument('vi', 'ngày nghỉ', 'MY_ABSENCE');

// -- Ý định mới: Ngày công, chấm công
manager.addDocument('vi', 'xem ngày công', 'MY_ATTENDANCE');
manager.addDocument('vi', 'dữ liệu chấm công', 'MY_ATTENDANCE');
manager.addDocument('vi', 'thông tin giờ vào giờ ra', 'MY_ATTENDANCE');
manager.addDocument('vi', 'có đi làm không', 'MY_ATTENDANCE');
manager.addDocument('vi', 'giờ tăng ca', 'MY_ATTENDANCE');

// -- Ý định mới: Hợp đồng lao động
manager.addDocument('vi', 'xem hợp đồng lao động', 'MY_FILE_CONTRACT');
manager.addDocument('vi', 'chi tiết hợp đồng', 'MY_FILE_CONTRACT');
manager.addDocument('vi', 'hợp đồng của tôi', 'MY_FILE_CONTRACT');

// -- Ý định mới: Hình ảnh chấm công
manager.addDocument('vi', 'xem hình chấm công', 'MY_PHOTO_ATTENDANCE');
manager.addDocument('vi', 'ảnh chấm công', 'MY_PHOTO_ATTENDANCE');
manager.addDocument('vi', 'hình chụp lúc chấm công', 'MY_PHOTO_ATTENDANCE');

// -- Ý định mới: Hồ sơ cá nhân
manager.addDocument('vi', 'thông tin cá nhân', 'MY_PROFILE');
manager.addDocument('vi', 'hồ sơ của tôi', 'MY_PROFILE');
manager.addDocument('vi', 'xem profile', 'MY_PROFILE');
manager.addDocument('vi', 'thông tin của tôi', 'MY_PROFILE');

// Biến cờ để đảm bảo chỉ train mô hình 1 lần khi server vừa bật lên
let isTrained = false;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userMessage = body.message?.toLowerCase() || '';

    // Huấn luyện mô hình nếu chưa được huấn luyện
    if (!isTrained) {
      await manager.train();
      isTrained = true;
    }

    const aiResponse = await manager.process('vi', userMessage);
    
    // Nếu AI không chắc chắn (điểm score thấp) hoặc không tìm thấy, gán là UNKNOWN
    let matchedIntent = "UNKNOWN";
    if (aiResponse.intent !== 'None' && aiResponse.score > 0.5) {
      matchedIntent = aiResponse.intent;
    }

    console.log(`[AI] Nhận diện câu: "${userMessage}" -> Intent: ${matchedIntent} (Tự tin: ${Math.round(aiResponse.score * 100)}%)`);

    //@ ts-ignore
    const responseData = sampleData.find(item => item.intent === matchedIntent);

    if (responseData) {
      return NextResponse.json({ success: true, data: responseData });
    } else {
      return NextResponse.json({
        success: false,
        message: null
      });
    }
  } catch (error) {
    console.error("Lỗi:", error);
    return NextResponse.json({ success: false, message: "Lỗi Server" }, { status: 500 });
  }
}
