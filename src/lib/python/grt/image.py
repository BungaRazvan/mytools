import cv2
import win32gui
import win32ui
import win32api
import numpy as np
from ctypes import windll
import pygetwindow as gw
import pyautogui

from PIL import ImageGrab
from PIL import Image as PILImage

SCREEN_SIZE = ImageGrab.grab().size


class Image:
    def __init__(self, left_x: int, top_y: int, right_x: int, bottom_y: int) -> None:
        self.left_x = left_x
        self.top_y = top_y
        self.right_x = right_x
        self.bottom_y = bottom_y
        self.image = None

    def __call__(self):
        self.image = np.array(
            ImageGrab.grab(bbox=[self.left_x, self.top_y, self.right_x, self.bottom_y])
        )
        return self.image

    @staticmethod
    def thresholding(image, thresh, max_value=255):
        ret, thresh = cv2.threshold(
            Image.grayscale(image), thresh, max_value, cv2.THRESH_BINARY
        )

        return thresh

    @staticmethod
    def grayscale(image):
        return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

    @staticmethod
    def normal(image):
        return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

    # def screenshot(self, window_title):
    #     """
    #     Screenshot for background Win32 apps.
    #     :return: screen as OpenCV image format.
    #     """

    #     # OBTAIN IMAGE OF THE WINDOW SCREEN
    #     hwnd = win32gui.FindWindow(None, window_title)
    #     print(win32gui.GetForegroundWindow())
    #     if not hwnd:
    #         print("Window not found.")
    #         return

    #     # win32gui.SetForegroundWindow(hwnd)
    #     hwnd_dc = win32gui.GetWindowDC(hwnd)
    #     mfc_dc = win32ui.CreateDCFromHandle(hwnd_dc)
    #     save_dc = mfc_dc.CreateCompatibleDC()
    #     save_bit_map = win32ui.CreateBitmap()
    #     save_bit_map.CreateCompatibleBitmap(mfc_dc, w, h)
    #     save_dc.SelectObject(save_bit_map)
    #     result = windll.user32.PrintWindow(hwnd_dc, save_dc.GetSafeHdc(), 0)
    #     print(result, hwnd)

    #     # if not result:
    #     #     print("Failed to capture window contents.")
    #     #     return

    #     bmpinfo = save_bit_map.GetInfo()
    #     bmpstr = save_bit_map.GetBitmapBits(True)
    #     img = PILImage.frombuffer(
    #         "RGB",
    #         (bmpinfo["bmWidth"], bmpinfo["bmHeight"]),
    #         bmpstr,
    #         "raw",
    #         "BGRX",
    #         0,
    #         1,
    #     )

    #     win32gui.DeleteObject(save_bit_map.GetHandle())
    #     save_dc.DeleteDC()
    #     mfc_dc.DeleteDC()
    #     win32gui.ReleaseDC(hwnd, hwnd_dc)
    #     # CONVERT IT TO OPENCV FORMAT
    #     img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
    #     cv2.imshow("bg_img", img)    #     left, top, right, bot = win32gui.GetWindowRect(hwnd)
    #     w = right - left
    #     h = bot - top

    #     return img

    def screenshot(self, window_title):
        """Capture and display a preview of a window."""

        hwnd = win32gui.FindWindow("UnityWndClass", window_title)
        hwnd_2 = self.get_inner_windows(hwnd)
        print(hwnd, hwnd_2)
        # print(self.list_window_names())

        # Uncomment the following line if you use a high DPI display or >100% scaling size
        # windll.user32.SetProcessDPIAware()

        # Change the line below depending on whether you want the whole window
        # or just the client area.
        # left, top, right, bot = win32gui.GetClientRect(hwnd)
        print(hwnd)
        left, top, right, bot = win32gui.GetWindowRect(hwnd)
        w = right - left
        h = bot - top

        hwndDC = win32gui.GetWindowDC(hwnd)
        mfcDC = win32ui.CreateDCFromHandle(hwndDC)
        saveDC = mfcDC.CreateCompatibleDC()

        saveBitMap = win32ui.CreateBitmap()
        saveBitMap.CreateCompatibleBitmap(mfcDC, w, h)

        saveDC.SelectObject(saveBitMap)

        # Change the line below depending on whether you want the whole window
        # or just the client area.
        # result = windll.user32.PrintWindow(hwnd, saveDC.GetSafeHdc(), 1)
        result = windll.user32.PrintWindow(hwnd, saveDC.GetSafeHdc(), 0)
        print(result, "===")

        bmpinfo = saveBitMap.GetInfo()
        print(bmpinfo)
        bmpstr = saveBitMap.GetBitmapBits(True)
        img = PILImage.frombuffer(
            "RGB",
            (bmpinfo["bmWidth"], bmpinfo["bmHeight"]),
            bmpstr,
            "raw",
            "BGRX",
            0,
            1,
        )

        win32gui.DeleteObject(saveBitMap.GetHandle())
        saveDC.DeleteDC()
        mfcDC.DeleteDC()

        win32gui.ReleaseDC(hwnd, hwndDC)
        # CONVERT IT TO OPENCV FORMAT
        img = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)
        cv2.imshow(
            "bg_img", img
        )  #     left, top, right, bot = win32gui.GetWindowRect(hwnd)

        # print(get_inner_windows(hwnd), hwnd)

    # Capture the screen area corresponding to the window
    # screenshot = np.array()

    # Display the window preview
    # cv2.imshow("Window Preview", cv2.cvtColor(screenshot, cv2.COLOR_BGR2RGB))

    @staticmethod
    def list_window_names():
        def winEnumHandler(hwnd, ctx):
            print(hex(hwnd), '"' + win32gui.GetWindowText(hwnd) + '"')

        win32gui.EnumWindows(winEnumHandler, None)

    @staticmethod
    def get_inner_windows(whndl):
        def callback(hwnd, hwnds):
            hwnds[win32gui.GetClassName(hwnd)] = hwnd
            return True

        hwnds = {}
        win32gui.EnumChildWindows(whndl, callback, hwnds)
        return hwnds


class StarRailRewardsTextImage(Image):
    def __init__(self) -> None:
        super().__init__(
            100,
            int(SCREEN_SIZE[1] / 2) - 200,
            int(SCREEN_SIZE[1] / 4),
            int(SCREEN_SIZE[1] / 2) - 120,
        )

    def __call__(self):
        return self.normal(super().__call__())


class StarRailItemsImage(Image):
    def __init__(self) -> None:
        super().__init__(
            220,
            int(SCREEN_SIZE[1] / 2) - 200,
            int(SCREEN_SIZE[1] / 2),
            SCREEN_SIZE[1] - 300,
        )

    def __call__(self):
        return self.thresholding(super().__call__(), 200)
