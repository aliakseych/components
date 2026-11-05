import { PackageInfo, PackageInfoContent, PackageInfoDependencies, PackageInfoDependency, PackageInfoDescription, PackageInfoHeader, PackageInfoChangeType, PackageInfoName, PackageInfoVersion } from "../index";

export default function Demo() {
  return (
    <PackageInfo changeType="minor" className="w-full max-w-xl" currentVersion="18.2.0" name="react" newVersion="19.0.0">
      <PackageInfoHeader>
        <PackageInfoName />
        <PackageInfoChangeType />
      </PackageInfoHeader>
      <PackageInfoVersion />
      <PackageInfoDescription>A library for building user interfaces.</PackageInfoDescription>
      <PackageInfoContent>
        <PackageInfoDependencies>
          <PackageInfoDependency name="scheduler" version="^0.25.0" />
        </PackageInfoDependencies>
      </PackageInfoContent>
    </PackageInfo>
  );
}
