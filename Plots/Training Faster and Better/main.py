import os
import matplotlib.pyplot as plt
import numpy as np

os.chdir(os.path.dirname(os.path.realpath(__file__)))

def renderBellCurve():
    def f(x, std, mean):
        return np.e**(-0.5*((x-mean)/std)**2)/(std*np.sqrt(2*np.pi))

    inputs = np.linspace(-11, 11, 1000)
    outputs = f(inputs, 3, 0)

    plt.plot(inputs, outputs, "k")
    plt.axis([-11, 11, -0.01, 0.145])
    plt.axis('off')
    plt.savefig("output/bell-curve.png", bbox_inches='tight')
    plt.show()

renderBellCurve()