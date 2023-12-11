let map; // 지도
let treasureMarker; // 보물 찍어줄 마커
let treasureLocation; // 보물 위치
let findTreasuerCount = 0; // 스코어 기본값 설정
let siteOpenTime; // 페이지가 열린 시작 시간
let customMarkerImageURL = '../image/Treasure.png'; // 마커이미지 설정
let showAnswerClicked = 0; // 정답 보기 버튼 클릭 수 추적
let answerClicked = 0; // 정답보기를 썼는지 알아보는 버튼


kakao.maps.load(() => { // 지도 불러오기
      const startPoint = new kakao.maps.LatLng(37.5665, 126.9780); // 처음위치 = 서울시청
      siteOpenTime = new Date(); // 페이지가 열려있는 시간 초기값 설정
      map = new kakao.maps.Map(document.getElementById('map'), { // id="map" 인곳에 지도 만들기
            center: startPoint, //처음 지정해둔 장소를 중앙으로
            level: 4, //지도의 초기 확대수준
            disableDoubleClickZoom: true, //더블클릭하여 지도의 확대를 비활성화
            scrollwheel: false // 스크롤하여 지도의 확대를 비활성화
      });
      const customMarkerImage = new kakao.maps.MarkerImage(
            customMarkerImageURL, // 이미지 URL
            new kakao.maps.Size(50, 50), // 보물(마커) 크기 지정
            {
                  offset: new kakao.maps.Point(30, 30), // 이미지의 중심에서 보물(마커) 위치까지의 오프셋
                  shape: 'rect', // 이미지 모양 (기본은 'rect'로 사용)
            }
      );
      // 보물(마커) 불러오기
      treasureMarker = new kakao.maps.Marker({
            position: startPoint, //보물(마커) startPoint에 지정해두기
            image: customMarkerImage // 보물(마커) 설정 
      });
      treasureMarker.setMap(map); // 보물(마커) 찍기

      setRandomTreasureLocation(); // 보물(마커)위치 랜덤 조정

      // 보물 랜덤 위치 조정 버튼 클릭 시
      document.getElementById('randomTreasure').addEventListener('click', () => { // id="findTreasure" 버튼을 클릭했을 시
            setRandomTreasureLocation();

            const refactorTextElement = document.getElementById('treasureLocationMessage'); // id ="treasureLocationMessage" 에 메세지 띄우기
            refactorTextElement.textContent = '보물 위치를 랜덤으로 조정했습니다';

            setTimeout(() => { // 2초후  refactorTextElement 메세지 삭제
                  refactorTextElement.textContent = '';
            }, 2000);
      });

      // 힌트 보기 버튼 클릭 시
      document.getElementById('getHint').addEventListener('click', () => {
            if (treasureLocation) {
                  // 보물(마커)의 위치 정보를 힌트로 표시
                  const geocoder = new kakao.maps.services.Geocoder();
                  geocoder.coord2RegionCode(treasureLocation.getLng(), treasureLocation.getLat(), (result, status) => {
                        if (status === kakao.maps.services.Status.OK && result[0]) {
                              const region = result[0].address_name;
                              document.getElementById('hintText').textContent = `대략적인 위치: ${region}`;
                        }

                        setTimeout(() => { //2초후 hintText 삭제
                              document.getElementById('hintText').textContent = '';
                        }, 2000);
                  });
            }
      });


      // 정답 보기 버튼 클릭 시
      document.getElementById('showAnswer').addEventListener('click', () => {
            if (showAnswerClicked === 0) {
                  showAnswerClicked = 1; // 첫 번째 클릭
                  document.getElementById('answerText').textContent = '정답을 보려면 한번만 더 눌러주세요'; // 힌트 텍스트 설정
                  setTimeout(() => {
                        showAnswerClicked = 0; // 3초 후 클릭 수 초기화
                        document.getElementById('answerText').textContent = ''; // 힌트 텍스트 삭제
                  }, 3000); // 3초 동안 정답을 보기 위한 대기 시간
            } else if (showAnswerClicked === 1) {
                  showAnswerClicked = 2; // 두 번째 클릭
                  if (treasureLocation) {
                        map.panTo(treasureLocation); // 보물의 위치로 지도 이동
                        document.getElementById('answerText').textContent = '보물의 위치로 이동합니다'; // 힌트 텍스트 설정
                        answerClicked = 1; // 정답보기를 눌렀다 판단
                        setTimeout(() => {
                              showAnswerClicked = 0; // 3초 후 클릭 수 초기화
                              document.getElementById('answerText').textContent = ''; // 힌트 텍스트 삭제
                              // 보물 찾기를 수행하는 함수를 호출
                        }, 3000);
                  }
            }
      });


      // '지역 설정' 버튼 클릭 시
      document.getElementById('settingLocation').addEventListener('click', () => {
            const locationInput = document.getElementById('locationInput');
            const locationName = locationInput.value;

            if (locationName) {
                  const geocoder = new kakao.maps.services.Geocoder();
                  geocoder.addressSearch(locationName, (results, status) => {
                        if (status === kakao.maps.services.Status.OK && results.length > 0) {
                              const location = results[0].y;
                              const longitude = results[0].x;
                              map.setCenter(new kakao.maps.LatLng(location, longitude)); // 검색 결과의 좌표로 지도 중심 설정
                              searchLocationInfo(new kakao.maps.LatLng(location, longitude)); // 보물(마커) 주변 건물 가져오기

                              // 랜덤으로 좌표 주위의 위치 생성 (검색한 지역 내에서만)
                              const randomLat = location + (Math.random() - 0.3) / 500;
                              const randomLng = longitude + (Math.random() - 0.3) / 500;

                              const newLocation = new kakao.maps.LatLng(randomLat, randomLng);
                              treasureMarker.setPosition(newLocation);
                              treasureLocation = newLocation;

                              document.getElementById('changeLocation').textContent = `${locationName} 지역의 보물 위치로 설정했습니다.`;
                              locationInput.value = ''; // 입력 필드 초기화;
                              setRandomTreasureLocation()
                        } else {
                              document.getElementById('changeLocation').textContent = '지역을 찾을 수 없습니다.';
                        }

                        setTimeout(() => {
                              document.getElementById('changeLocation').textContent = '';
                        }, 2000);
                  });
            } else {
                  document.getElementById('changeLocation').textContent = '지역을 입력하세요.';
            }
      });

      kakao.maps.event.addListener(treasureMarker, 'click', () => { // 보물을 클릭했을 때
            if (answerClicked === 1) {
                  alert('정답보기를 사용하고 보물을 찾았습니다\n보물을 찾은횟수는 카운트되지 않습니다'); // 팝업창으로 메세지 표시
                  alert('보물의 위치를 다시 재설정 했습니다!'); // 팝업창으로 메세지 표시
                  setRandomTreasureLocation(); // 보물(마커)위치 랜덤 조정
                  answerClicked = 0;
            }
            else {
                  alert('보물을 찾았습니다! 축하합니다!'); // 팝업창으로 메세지 표시

                  ++findTreasuerCount // 스코어 수 올려주기
                  console.log(`FindTreasuerCount : ` + findTreasuerCount) // 콘솔로그에 스코어 표시

                  document.getElementById('scoreCount').textContent = findTreasuerCount; // 스코어 업데이트

                  alert('보물의 위치를 다시 재설정 했습니다!'); // 팝업창으로 메세지 표시
                  setRandomTreasureLocation(); // 보물(마커)위치 랜덤 조정
            }
      });
});

function setRandomTreasureLocation() { // 보물(마커)위치 랜덤 조정
      const startPoint = map.getCenter();
      treasureLocation = new kakao.maps.LatLng(
            startPoint.getLat() + (Math.random() - 0.3) / 10, // 위도 랜덤범위지정
            startPoint.getLng() + (Math.random() - 0.3) / 10 // 경도 랜덤범위지정
      );

      treasureMarker.setPosition(treasureLocation); // 보물(마커) 위치 업데이트

      searchLocationInfo(treasureLocation); // 보물 주변 건물 업데이트
}

function updateSiteUptime() { // 페이지가 열려 있는 시간을 계산하여 표시
      const currentTime = new Date(); //현재 시간정보를 가져옴
      const timeDifference = currentTime - siteOpenTime; // currentTime - siteOpenTime을 빼서 사이의 차이를 계산

      const hours = Math.floor(timeDifference / (1000 * 60 * 60)); // 시 계산기
      const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60)); // 분 계산기
      const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000); // 초 계산기

      const siteUptimeElement = document.getElementById('siteUptime'); // id ="siteUptime" 에 메세지 띄우기
      siteUptimeElement.textContent = `${hours}시간 ${minutes}분 ${seconds}초`;
}

setInterval(updateSiteUptime, 1000); // 1초마다 페이지가 열려 있는 시간을 업데이트 

function searchLocationInfo(location) { // 보물(마커)주변의 건물 정보를 가져옴
      const places = new kakao.maps.services.Places();

      places.keywordSearch('보물 주변 건물', (results, status) => {
            if (status === kakao.maps.services.Status.OK) {
                  const infoList = document.getElementById('infoList');
                  infoList.innerHTML = '';

                  results.forEach((place) => {
                        const item = document.createElement('li');
                        item.textContent = place.place_name;
                        infoList.appendChild(item);
                  });
            } else {
                  document.getElementById('infoList').innerHTML = '보물 주변 건물을 찾을 수 없습니다.';
            }
      }, {  
            location: location,
            radius: 1000 // 반경 1km내에서 건물 찾기
      });
}
