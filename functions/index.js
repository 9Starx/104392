const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// 每分鐘執行一次的定時函數
exports.autoUpdateOrderStatus = functions.pubsub
  .schedule('every 1 minutes')
  .timeZone('Asia/Taipei')
  .onRun(async (context) => {
    try {
      console.log('開始自動更新訂單狀態...');
      
      // 獲取所有待處理的訂單
      const pendingOrdersSnapshot = await db.collection('orders')
        .where('status', '==', 'pending')
        .get();
      
      if (pendingOrdersSnapshot.empty) {
        console.log('沒有待處理的訂單');
        return null;
      }
      
      const now = new Date();
      const batch = db.batch();
      let updateCount = 0;
      
      pendingOrdersSnapshot.forEach(doc => {
        const order = doc.data();
        let orderCreatedAt;
        
        // 處理不同格式的 createdAt
        if (order.createdAt && order.createdAt.toDate) {
          orderCreatedAt = order.createdAt.toDate();
        } else if (typeof order.createdAt === 'string') {
          orderCreatedAt = new Date(order.createdAt);
        } else {
          orderCreatedAt = new Date(order.createdAt);
        }
        
        // 檢查是否超過1分鐘
        const timeDiff = now - orderCreatedAt;
        const oneMinuteInMs = 60000; // 1分鐘
        
        if (timeDiff >= oneMinuteInMs) {
          console.log(`更新訂單 ${doc.id} 狀態為 processing`);
          batch.update(doc.ref, {
            status: 'processing',
            autoUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
          updateCount++;
        }
      });
      
      if (updateCount > 0) {
        await batch.commit();
        console.log(`成功更新 ${updateCount} 個訂單狀態`);
      } else {
        console.log('沒有需要更新的訂單');
      }
      
      return null;
    } catch (error) {
      console.error('自動更新訂單狀態時發生錯誤:', error);
      throw error;
    }
  });

// 可選：訂單創建時觸發的函數（立即處理）
exports.onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    try {
      const order = snap.data();
      const orderId = context.params.orderId;
      
      console.log(`新訂單創建: ${orderId}`);
      
      // 設定1分鐘後的延遲執行
      setTimeout(async () => {
        try {
          const orderRef = db.collection('orders').doc(orderId);
          const orderDoc = await orderRef.get();
          
          if (orderDoc.exists && orderDoc.data().status === 'pending') {
            await orderRef.update({
              status: 'processing',
              autoUpdatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`訂單 ${orderId} 自動更新為 processing`);
          }
        } catch (error) {
          console.error(`更新訂單 ${orderId} 時發生錯誤:`, error);
        }
      }, 60000); // 1分鐘延遲
      
      return null;
    } catch (error) {
      console.error('處理新訂單時發生錯誤:', error);
      return null;
    }
  }); 