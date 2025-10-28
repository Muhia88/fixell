from setuptools import setup, find_packages

setup(
    name='fixell-server',
    version='0.1.0',
    description='Fixell backend package',
    packages=find_packages(),
    py_modules=['config'],
    include_package_data=True,
)
